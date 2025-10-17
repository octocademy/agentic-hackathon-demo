import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import branchRouter, { resetBranches } from './branch';
import orderRouter, { resetOrders } from './order';
import orderDetailRouter, { resetOrderDetails } from './orderDetail';
import productRouter, { resetProducts } from './product';
import deliveryRouter, { resetDeliveries } from './delivery';
import orderDetailDeliveryRouter, { resetOrderDetailDeliveries } from './orderDetailDelivery';
import { branches as seedBranches } from '../seedData';
import { orders as seedOrders } from '../seedData';
import { products as seedProducts } from '../seedData';

let app: express.Express;

describe('Integration Tests - Key Workflows', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/branches', branchRouter);
        app.use('/orders', orderRouter);
        app.use('/order-details', orderDetailRouter);
        app.use('/products', productRouter);
        app.use('/deliveries', deliveryRouter);
        app.use('/order-detail-deliveries', orderDetailDeliveryRouter);
        // Reset all data to seed state for test isolation
        resetBranches();
        resetOrders();
        resetOrderDetails();
        resetProducts();
        resetDeliveries();
        resetOrderDetailDeliveries();
    });

    describe('Complete Order Workflow', () => {
        it('should complete full order lifecycle: create branch, place order, add order details', async () => {
            // Step 1: Create a new branch
            const newBranch = {
                branchId: 10,
                headquartersId: 1,
                name: "Integration Test Branch",
                description: "Test branch for integration testing",
                address: "123 Test Street",
                contactPerson: "Test Manager",
                email: "test@octocat.com",
                phone: "555-9999"
            };
            const branchResponse = await request(app).post('/branches').send(newBranch);
            expect(branchResponse.status).toBe(201);
            expect(branchResponse.body.branchId).toBe(10);

            // Step 2: Create an order for the new branch
            const newOrder = {
                orderId: 100,
                branchId: 10,
                orderDate: new Date().toISOString(),
                name: "Integration Test Order",
                description: "Test order for workflow testing",
                status: "pending"
            };
            const orderResponse = await request(app).post('/orders').send(newOrder);
            expect(orderResponse.status).toBe(201);
            expect(orderResponse.body.orderId).toBe(100);
            expect(orderResponse.body.branchId).toBe(10);

            // Step 3: Add order details to the order
            const orderDetail1 = {
                orderDetailId: 200,
                orderId: 100,
                productId: 1,
                quantity: 5,
                unitPrice: 129.99,
                notes: "SmartFeeder One units"
            };
            const orderDetailResponse = await request(app).post('/order-details').send(orderDetail1);
            expect(orderDetailResponse.status).toBe(201);
            expect(orderDetailResponse.body.orderId).toBe(100);
            expect(orderDetailResponse.body.productId).toBe(1);

            // Step 4: Verify the order can be retrieved with all details
            const getOrderResponse = await request(app).get('/orders/100');
            expect(getOrderResponse.status).toBe(200);
            expect(getOrderResponse.body.status).toBe('pending');

            // Step 5: Update order status
            const updatedOrder = {
                ...newOrder,
                status: 'processing'
            };
            const updateResponse = await request(app).put('/orders/100').send(updatedOrder);
            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.status).toBe('processing');
        });

        it('should handle order with multiple products and verify total workflow', async () => {
            // Create order with existing branch
            const multiProductOrder = {
                orderId: 101,
                branchId: 1,
                orderDate: new Date().toISOString(),
                name: "Multi-Product Order",
                description: "Order with multiple product types",
                status: "pending"
            };
            await request(app).post('/orders').send(multiProductOrder);

            // Add multiple order details
            const orderDetails = [
                {
                    orderDetailId: 201,
                    orderId: 101,
                    productId: 1,
                    quantity: 3,
                    unitPrice: 129.99,
                    notes: "SmartFeeder One"
                },
                {
                    orderDetailId: 202,
                    orderId: 101,
                    productId: 2,
                    quantity: 2,
                    unitPrice: 199.99,
                    notes: "AutoClean Litter Dome"
                },
                {
                    orderDetailId: 203,
                    orderId: 101,
                    productId: 3,
                    quantity: 1,
                    unitPrice: 89.99,
                    notes: "CatFlix Entertainment Portal"
                }
            ];

            for (const detail of orderDetails) {
                const response = await request(app).post('/order-details').send(detail);
                expect(response.status).toBe(201);
                expect(response.body.orderId).toBe(101);
            }

            // Verify all order details were created
            const allOrderDetailsResponse = await request(app).get('/order-details');
            const orderDetailsFor101 = allOrderDetailsResponse.body.filter(
                (od: any) => od.orderId === 101
            );
            expect(orderDetailsFor101.length).toBe(3);
        });
    });

    describe('Product and Inventory Workflow', () => {
        it('should retrieve products and verify product details', async () => {
            // Get all products
            const productsResponse = await request(app).get('/products');
            expect(productsResponse.status).toBe(200);
            expect(productsResponse.body.length).toBeGreaterThan(0);

            // Get specific product
            const productResponse = await request(app).get('/products/1');
            expect(productResponse.status).toBe(200);
            expect(productResponse.body.productId).toBe(1);
            expect(productResponse.body.name).toBe('SmartFeeder One');
        });

        it('should create new product and verify it can be used in orders', async () => {
            // Create a new product
            const newProduct = {
                productId: 99,
                supplierId: 1,
                name: "Integration Test Product",
                description: "Product created for testing",
                price: 59.99,
                sku: "TEST-001",
                unit: "piece"
            };
            const productResponse = await request(app).post('/products').send(newProduct);
            expect(productResponse.status).toBe(201);

            // Use the new product in an order detail
            const orderDetail = {
                orderDetailId: 299,
                orderId: 1,
                productId: 99,
                quantity: 10,
                unitPrice: 59.99,
                notes: "New product test"
            };
            const orderDetailResponse = await request(app).post('/order-details').send(orderDetail);
            expect(orderDetailResponse.status).toBe(201);
            expect(orderDetailResponse.body.productId).toBe(99);
        });
    });

    describe('Delivery and Fulfillment Workflow', () => {
        it('should create delivery and link to order details', async () => {
            // Create a delivery
            const newDelivery = {
                deliveryId: 99,
                supplierId: 1,
                deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                name: "Integration Test Delivery",
                description: "Test delivery for integration testing",
                status: "pending"
            };
            const deliveryResponse = await request(app).post('/deliveries').send(newDelivery);
            expect(deliveryResponse.status).toBe(201);
            expect(deliveryResponse.body.deliveryId).toBe(99);

            // Link delivery to order detail
            const orderDetailDelivery = {
                orderDetailDeliveryId: 99,
                orderDetailId: 1,
                deliveryId: 99,
                quantity: 5,
                notes: "Test delivery link"
            };
            const oddResponse = await request(app).post('/order-detail-deliveries').send(orderDetailDelivery);
            expect(oddResponse.status).toBe(201);
            expect(oddResponse.body.deliveryId).toBe(99);
            expect(oddResponse.body.orderDetailId).toBe(1);
        });

        it('should update delivery status workflow', async () => {
            // Create delivery
            const delivery = {
                deliveryId: 98,
                supplierId: 2,
                deliveryDate: new Date().toISOString(),
                name: "Status Test Delivery",
                description: "Testing status updates",
                status: "pending"
            };
            await request(app).post('/deliveries').send(delivery);

            // Update to in-transit
            const updatedDelivery1 = { ...delivery, status: 'in-transit' };
            const response1 = await request(app).put('/deliveries/98').send(updatedDelivery1);
            expect(response1.status).toBe(200);
            expect(response1.body.status).toBe('in-transit');

            // Update to delivered
            const updatedDelivery2 = { ...delivery, status: 'delivered' };
            const response2 = await request(app).put('/deliveries/98').send(updatedDelivery2);
            expect(response2.status).toBe(200);
            expect(response2.body.status).toBe('delivered');
        });
    });

    describe('Branch and Order Relationships', () => {
        it('should verify branch can have multiple orders', async () => {
            // Get existing branch
            const branchResponse = await request(app).get('/branches/1');
            expect(branchResponse.status).toBe(200);
            const branchId = branchResponse.body.branchId;

            // Create multiple orders for the same branch
            const order1 = {
                orderId: 102,
                branchId: branchId,
                orderDate: new Date().toISOString(),
                name: "First Order for Branch",
                description: "Testing multiple orders",
                status: "pending"
            };
            const order2 = {
                orderId: 103,
                branchId: branchId,
                orderDate: new Date().toISOString(),
                name: "Second Order for Branch",
                description: "Testing multiple orders",
                status: "pending"
            };

            await request(app).post('/orders').send(order1);
            await request(app).post('/orders').send(order2);

            // Verify both orders exist
            const allOrdersResponse = await request(app).get('/orders');
            const branchOrders = allOrdersResponse.body.filter(
                (o: any) => o.branchId === branchId
            );
            expect(branchOrders.length).toBeGreaterThanOrEqual(2);
        });

        it('should delete branch operations', async () => {
            // Create a branch specifically for deletion
            const tempBranch = {
                branchId: 999,
                headquartersId: 1,
                name: "Temporary Branch",
                description: "To be deleted",
                address: "999 Temp St",
                contactPerson: "Temp Person",
                email: "temp@octocat.com",
                phone: "555-0000"
            };
            await request(app).post('/branches').send(tempBranch);

            // Verify it exists
            const getResponse = await request(app).get('/branches/999');
            expect(getResponse.status).toBe(200);

            // Delete it
            const deleteResponse = await request(app).delete('/branches/999');
            expect(deleteResponse.status).toBe(204);

            // Verify it's gone
            const getAfterDeleteResponse = await request(app).get('/branches/999');
            expect(getAfterDeleteResponse.status).toBe(404);
        });
    });

    describe('Cross-Component Data Validation', () => {
        it('should maintain data consistency across related components', async () => {
            // Create a complete workflow and verify data consistency
            const testBranch = {
                branchId: 500,
                headquartersId: 1,
                name: "Consistency Test Branch",
                description: "Testing data consistency",
                address: "500 Consistent Ave",
                contactPerson: "Data Manager",
                email: "data@octocat.com",
                phone: "555-5000"
            };
            await request(app).post('/branches').send(testBranch);

            const testOrder = {
                orderId: 500,
                branchId: 500,
                orderDate: new Date().toISOString(),
                name: "Consistency Test Order",
                description: "Testing data consistency",
                status: "pending"
            };
            await request(app).post('/orders').send(testOrder);

            const testOrderDetail = {
                orderDetailId: 500,
                orderId: 500,
                productId: 1,
                quantity: 1,
                unitPrice: 129.99,
                notes: "Consistency test"
            };
            await request(app).post('/order-details').send(testOrderDetail);

            // Verify all components exist and are linked correctly
            const branchCheck = await request(app).get('/branches/500');
            expect(branchCheck.status).toBe(200);
            expect(branchCheck.body.branchId).toBe(500);

            const orderCheck = await request(app).get('/orders/500');
            expect(orderCheck.status).toBe(200);
            expect(orderCheck.body.branchId).toBe(500);

            const orderDetailCheck = await request(app).get('/order-details/500');
            expect(orderDetailCheck.status).toBe(200);
            expect(orderDetailCheck.body.orderId).toBe(500);

            const productCheck = await request(app).get('/products/1');
            expect(productCheck.status).toBe(200);
            expect(productCheck.body.productId).toBe(1);
        });
    });
});
