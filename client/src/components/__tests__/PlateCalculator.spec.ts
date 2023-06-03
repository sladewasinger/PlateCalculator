// myTest.spec.js

// Import Cypress commands
import PlateCalculator from '@/components/PlateCalculator.vue';

describe('PlateCalculator', () => {
    it('should display the correct text', () => {
        cy.mount(PlateCalculator)
        cy.get('.plate-calculator')
            .should('contain', 'Plate Calculator');
    });

    it('should calculate the correct plates', () => {
        cy.mount(PlateCalculator)
        cy.get('.input-container input').clear();
        cy.get('.input-container input').type('260');

        const expectedItems = ['45', '45', '10', '5', '2.5'];

        cy.get('.text-output ul')
            .find('li')
            .should('have.length', 5)
            .each(($el, index) => {
                const expectedItem = expectedItems[index];

                cy.wrap($el).should('contain', expectedItem);
            });
    });
});
