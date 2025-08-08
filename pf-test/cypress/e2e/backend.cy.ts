const apiUrl = 'http://localhost:3000'
let uuid: string;
let itemid_test: number;
let itemName: string = "iPhone 1888";
const username = 'Testuser_' + Math.random().toString(36).substring(7);
const password = 'Testpass_' + Math.random().toString(36).substring(7);  

// GET all items
describe('GET ITEMS', () => {
  it("should return an array of items", () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}`,
    }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body).to.be.an("array")
    })
  })
})

// Register tests
describe('Register User Test', () => {
  it('should register a user and return a uuid', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/register`,
      body: { username, password }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.status).to.eq('success');
      expect(response.body.uuid).to.exist;  
      uuid = response.body.uuid;
    });
  });

  it('should fail if username already exists', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/register`,
      body: { username, password: 'NewPassword123' },
      failOnStatusCode: false 
    }).then((response) => {
      expect(response.status).to.eq(409);
      expect(response.body.status).to.eq('fail');
      expect(response.body.message).to.eq('Username already exists');
    });
  });
})

// Login tests
describe('Login Test', () => {
  it('should fail if username is incorrect', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      body: { username: 'WrongUser', password },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.eq('Invalid credentials');
    });
  });

  it('should fail if password is incorrect', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      body: { username, password: 'WrongPassword' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.eq('Invalid credentials');
    });
  });

  it('should login and match uuid', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      body: { username, password }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.uuid).to.eq(uuid);
    });
  });
});

// Create item tests
describe('Create Item Test', () => {
  it('should fail if body is incomplete', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/sell`,
      body: { name: 'Test Item' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.eq('Name, detail, seller and date are required');
    });
  });

  it('should fail if date is invalid', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/sell`,
      body: { name: 'Test Item', detail: 'Test item detail', seller: uuid, date: 'invalid-date' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.eq('Invalid date format');
    });
  });

  it('should create item successfully', () => {
    const validDate = new Date().toISOString();
    cy.request({
      method: 'POST',
      url: `${apiUrl}/sell`,
      body: {
        name: itemName,
        detail: 'This is a test item.',
        image: 'htt...4297-9994-f1231ddfa4a8',
        status: 1,
        seller: uuid,
        date: validDate  
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.status).to.eq('success');
      itemid_test = response.body.id;  
    });
  });
});

// Update item tests
describe('Update Item Test', () => {
  const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
  const newNameFinal = `${itemName} (updated)`;
  const validDate = new Date().toISOString();

  it('should fail with non-owner uuid', () => {
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/sell`,
      body: { item_id: itemid_test, name: 'Fake edit', seller: fakeUuid, date: validDate },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(403);
      expect(response.body.message).to.eq('Not authorized to edit this item');
    });
  });

  it('should fail if body is incomplete', () => {
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/sell`,
      body: { seller: uuid },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail if date is invalid', () => {
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/sell`,
      body: { item_id: itemid_test, name: 'Invalid date', seller: uuid, date: 'invalid-date' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should update successfully', () => {
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/sell`,
      body: { item_id: itemid_test, name: newNameFinal, seller: uuid, date: validDate }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data[0].name).to.eq(newNameFinal);
    });
  });
});

// Verify update
describe('Verify Updated Item via GET', () => {
  it('should show updated name', () => {
    const expectedName = `${itemName} (updated)`;
    cy.request(`${apiUrl}`).then((res) => {
      const found = res.body.find((it: any) => it?.id === itemid_test);
      expect(found.name).to.eq(expectedName);
    });
  });
});

// Buy item tests
describe('Buy Item Test', () => {
  const buyerUuid = 'd57fbba9-6e0a-4297-9994-f1231ddfa4a8';
  const notExistItemId = 999999;

  it('should fail if missing fields', () => {
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/buy`,
      body: { uuid: buyerUuid },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail if item does not exist', () => {
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/buy`,
      body: { uuid: buyerUuid, item_id: notExistItemId },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('should fail if buying own item', () => {
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/buy`,
      body: { uuid: uuid, item_id: itemid_test },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(403);
    });
  });

  it('should buy successfully with different uuid', () => {
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/buy`,
      body: { uuid: buyerUuid, item_id: itemid_test }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data[0].customer).to.eq(buyerUuid);
    });
  });
});

// Delete item tests
describe('Delete Item Test', () => {
  it('should delete and verify removal', () => {
    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/sell`,
      body: { uuid: uuid, item_id: itemid_test }
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.request(`${apiUrl}`).then((res) => {
        const found = res.body.find((it: any) => it?.id === itemid_test);
        expect(found).to.not.exist;
      });
    });
  });
});
