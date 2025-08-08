// describe('template spec', () => {
//   it('passes', () => {
//     cy.visit('http://localhost:3000')
//   })
// })

// describe('backend tests', () => {
//   it("checks the backend API", () => {
//     const apiUrl = 'http://localhost:3000/'
//     cy.request({
//       method: 'GET',
//       url: `${apiUrl}`,
//     }).then((res)=> {
//       cy.log(JSON.stringify(res))
//     })
//   })
// })


describe('backend tests', () => {
  it("check query item", () => {
    const apiUrl = 'http://localhost:3000/'
    cy.request({
      method: 'GET',
      url: `${apiUrl}`,
    }).then((res)=> {
      console.log(res)
      expect(res.status).to.eq(200)
      expect(res.body).to.be.a("array")
    })
  })
})