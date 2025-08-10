const apiUrl = Cypress.env('BACKEND_URL') || 'http://localhost:3000';

let sellerUuid: string;
let buyerUuid: string;
let itemId: number;

const itemName = 'iPhone 1888';
const sellerUsername = 'Testuser_' + Math.random().toString(36).slice(2);
const sellerPassword = 'Testpass_' + Math.random().toString(36).slice(2);

describe('Marketplace E2E (API with image upload)', () => {
  //
  // -------- LIST --------
  //
  it('GET /items → 200 array', () => {
    cy.request('GET', `${apiUrl}/items`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array');
    });
  });

  //
  // -------- REGISTER --------
  //
  it('POST /register (seller) → 201 returns uuid', () => {
    cy.request('POST', `${apiUrl}/register`, { username: sellerUsername, password: sellerPassword })
      .then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.status).to.eq('success');
        sellerUuid = res.body.uuid;
        expect(sellerUuid).to.be.a('string');
      });
  });

  it('POST /register duplicate username → 409', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/register`,
      body: { username: sellerUsername, password: 'NewPassword123' },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(409);
      expect(res.body.status).to.eq('fail');
      expect(res.body.message).to.eq('Username already exists');
    });
  });

  //
  // -------- LOGIN --------
  //
  it('POST /login wrong username → 401', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      body: { username: 'WrongUser', password: sellerPassword },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq('Invalid credentials');
    });
  });

  it('POST /login wrong password → 401', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      body: { username: sellerUsername, password: 'WrongPassword' },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq('Invalid credentials');
    });
  });

  it('POST /login success → uuid matches', () => {
    cy.request('POST', `${apiUrl}/login`, { username: sellerUsername, password: sellerPassword })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.uuid).to.eq(sellerUuid);
      });
  });

  //
  // -------- CREATE ITEM (/sell with multipart) --------
  //
  it('POST /sell invalid (JSON instead of multipart) → 400/415 with message', () => {
    // ส่ง JSON ธรรมดาให้ fail (API คาด multipart + image)
    cy.request({
      method: 'POST',
      url: `${apiUrl}/sell`,
      body: { name: 'Bad', detail: 'Bad', status: '1', userId: sellerUuid },
      failOnStatusCode: false
    }).then((res) => {
      expect([400, 415]).to.include(res.status);
      const msg = String(res.body?.message || res.body?.error || '').toLowerCase();
      expect(
        msg.includes('no image provided') || msg.includes('name, detail, userid and status')
      ).to.eq(true);
    });
  });

  it('POST /sell invalid (multipart but missing file) → 400 No image provided', () => {
    // เรียก task multipart โดยไม่แนบไฟล์
    cy.task('multipartRequest', {
      url: `${apiUrl}/sell`,
      method: 'POST',
      fields: {
        name: itemName,
        detail: 'This is a test item (no file).',
        status: '1',
        userId: sellerUuid
      },
      // filePath omitted on purpose
      fileField: 'image',
      contentType: 'image/jpeg'
    }).then((res: any) => {
      expect(res.status).to.eq(400);
      // API ส่ง { error: "No image provided" }
      const msg = (res.body?.error || res.body?.message || '').toLowerCase();
      expect(msg).to.include('no image provided');
    });
  });

  it('POST /sell success (multipart with dummy image) → 201 id returned', () => {
    cy.task('multipartRequest', {
      url: `${apiUrl}/sell`,
      method: 'POST',
      fields: {
        name: itemName,
        detail: 'This is a test item.',
        status: '1',
        userId: sellerUuid
      },
      filePath: 'cypress/fixtures/test-image.jpg',
      fileField: 'image',
      contentType: 'image/jpeg'
    }).then((res: any) => {
      expect(res.status).to.eq(201);
      expect(res.body.status).to.eq('success');
      expect(res.body).to.have.property('imageUrl');
      itemId = res.body.id;
      expect(itemId).to.be.a('number');
    });
  });

  //
  // -------- UPDATE ITEM (/sell PATCH) --------
  //
  it('PATCH /sell by non-owner → 403', () => {
    const validDate = new Date().toISOString();
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/sell`,
      body: { item_id: itemId, name: 'Fake edit', seller: fakeUuid, date: validDate },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.message).to.eq('Not authorized to edit this item');
    });
  });

  it('PATCH /sell missing fields → 400', () => {
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/sell`,
      body: { seller: sellerUuid },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('item_id, seller and date are required');
    });
  });

  it('PATCH /sell invalid date → 400', () => {
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/sell`,
      body: { item_id: itemId, name: 'Invalid date', seller: sellerUuid, date: 'invalid-date' },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Invalid date format');
    });
  });

  it('PATCH /sell success → verify via GET /items', () => {
    const newName = `${itemName} (updated)`;
    const validDate = new Date().toISOString();

    cy.request('PATCH', `${apiUrl}/sell`, { item_id: itemId, name: newName, seller: sellerUuid, date: validDate })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.status).to.eq('success');
        expect(res.body.data?.[0].name).to.eq(newName);
      });

    cy.request('GET', `${apiUrl}/items`).then((res) => {
      expect(res.status).to.eq(200);
      const found = res.body.find((it: any) => it?.id === itemId);
      expect(found).to.exist;
      expect(found.name).to.eq(newName);
    });
  });

  //
  // -------- REGISTER BUYER --------
  //
  it('POST /register (buyer) → 201 returns uuid', () => {
    const buyerName = 'Buyer_' + Math.random().toString(36).slice(2);
    const buyerPass = 'BuyerPass_' + Math.random().toString(36).slice(2);
    cy.request('POST', `${apiUrl}/register`, { username: buyerName, password: buyerPass })
      .then((res) => {
        expect(res.status).to.eq(201);
        buyerUuid = res.body.uuid;
        expect(buyerUuid).to.be.a('string').and.not.eq(sellerUuid);
      });
  });

  //
  // -------- BUY ITEM (/buy PATCH) --------
  //
  it('PATCH /buy missing fields → 400', () => {
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/buy`,
      body: { uuid: buyerUuid }, // missing item_id
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('User UUID and item_id are required');
    });
  });

  it('PATCH /buy buyer not found → 404', () => {
    const fakeBuyerUuid = '7f1f28ac-8f6f-45d2-b469-ced299c01a38';
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/buy`,
      body: { uuid: fakeBuyerUuid, item_id: itemId },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq('Buyer not found');
    });
  });

  it('PATCH /buy item not found → 404', () => {
    const notExistItemId = itemId + 99999;
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/buy`,
      body: { uuid: buyerUuid, item_id: notExistItemId },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq('Item not found');
    });
  });

  it('PATCH /buy own item → 403', () => {
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/buy`,
      body: { uuid: sellerUuid, item_id: itemId },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.message).to.eq('You cannot buy your own item');
    });
  });

  it('PATCH /buy success with different user → flags updated', () => {
    cy.request('PATCH', `${apiUrl}/buy`, { uuid: buyerUuid, item_id: itemId })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.status).to.eq('success');
        const u = res.body.data?.[0];
        expect(u.customer).to.eq(buyerUuid);
        expect(u.is_purchased).to.be.true;
        expect(u.is_active).to.be.false;
        expect(u.status).to.eq(0);
        expect(new Date(u.updatedAt).toString()).not.to.eq('Invalid Date');
      });

    // /items คืนชื่อ seller/customer (name) ไม่ใช่ uuid — ตรวจสถานะแทน
    cy.request('GET', `${apiUrl}/items`).then((res) => {
      const found = res.body.find((it: any) => it?.id === itemId);
      expect(found).to.exist;
      expect(found.is_purchased).to.eq(true);
      expect(found.is_active).to.eq(false);
      expect(found.status).to.eq(0);
    });
  });

  //
  // -------- DELETE ITEM --------
  //
it('DELETE /sell success and verify via GET /items', () => {
  cy.request('DELETE', `${apiUrl}/sell`, { uuid: sellerUuid, item_id: itemId })
    .then((res) => {
      expect([200, 204]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.status).to.eq('success');
        expect(res.body.id).to.eq(itemId);
      }
      // CHAIN: GET
      return cy.request('GET', `${apiUrl}/items`);
    })
    .then((res) => {
      expect(res.status).to.eq(200);
      const found = res.body.find((it: any) => it?.id === itemId);
      expect(found).to.not.exist;
    });
});

//
// -------- CLEANUP (secret API) --------
//
after(() => {
  const secretKey = "1234";
  //ควรเอาใส่ env

  const kill = (uuid?: string) =>
    uuid &&
    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/kill/user`,
      body: { uuid, secret: secretKey },
      failOnStatusCode: false
    }).then((res) => {
      expect([200, 204, 404]).to.include(res.status);
    });

  kill(sellerUuid);
  kill(buyerUuid);
});
