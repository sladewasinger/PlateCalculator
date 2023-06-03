// myTest.spec.js

// Import Cypress commands
import PlateCalculator from '@/components/PlateCalculator.vue';
import PNG from 'pngjs';
import pixelmatch from 'pixelmatch';

function base64ToPixelData(base64: string, width: number, height: number) {
    return new Promise<Uint8ClampedArray>((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');
            if (!context) {
                throw new Error('Context not found');
            }
            context.drawImage(img, 0, 0, width, height);
            const imageData = context.getImageData(0, 0, width, height);
            resolve(imageData.data);
        };
        img.src = 'data:image/png;base64,' + base64;
    });
}

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

    it('should display the correct image', () => {
        cy.mount(PlateCalculator)
        cy.get('.input-container input').clear();
        cy.get('.input-container input').type('260');

        cy.readFile('src/components/__tests__/images/260.png', 'base64').then(async (expectedImageBase64) => {
            const img = new Image();
            cy.log("Loaded image", img);

            cy.document().then((doc) => {
                const canvas = doc.getElementById('canvas') as HTMLCanvasElement;
                if (!canvas) {
                    throw new Error('Canvas not found');
                }

                const width = canvas.width;
                const height = canvas.height;


                const actualImageBase64 = canvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, '');
                cy.log('actualImageBase64', actualImageBase64);
                cy.log('expectedImageBase64', expectedImageBase64)
                cy.wrap(base64ToPixelData(expectedImageBase64, width, height)).then((expectedImageData: any) => {
                    cy.log('expectedImageData', expectedImageData)
                    expectedImageData = expectedImageData as Uint8ClampedArray;
                    cy.wrap(base64ToPixelData(actualImageBase64, width, height)).then((actualImageData: any) => {
                        cy.log('actualImageData', actualImageData)
                        actualImageData = actualImageData as Uint8ClampedArray;
                        const numDiffPixels = pixelmatch(expectedImageData, actualImageData, null, width, height, { threshold: 0.1 });
                        expect(numDiffPixels).to.be.lessThan(100);
                        cy.log('numDiffPixels', numDiffPixels);
                    });
                });
            });
        });
    });
});
