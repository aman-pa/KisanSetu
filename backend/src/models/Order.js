const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerRole: {
      type: String,
      enum: ['CONSUMER', 'BULK_BUYER'],
      required: true,
    },
    items: [
      {
        listing: { type: mongoose.Schema.Types.ObjectId, ref: 'ProduceListing', required: true },
        farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        cropName: String,
        quantityKg: Number,
        pricePerKg: Number,
        subtotal: Number,
        batchId: String,
      },
    ],
    totalProduceCost: {
      type: Number,
      required: true,
    },
    logisticsCost: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },
    logisticsPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    vehicleAssigned: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'ACCEPTED', 'PICKUP_VERIFIED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'DISPUTED', 'CANCELLED'],
      default: 'CONFIRMED',
    },
    logisticsStatus: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'PICKUP_VERIFIED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID_ESCROW', 'PAID', 'RELEASED_TO_FARMER', 'REFUNDED'],
      default: 'PAID_ESCROW',
    },
    paymentTransactionId: String,
    procurementRequestRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcurementRequest',
    },
    batchWindowEndsAt: {
      type: Date,
    },
    pickupTimestamp: {
      type: Date,
    },
    deliveryTimestamp: {
      type: Date,
    },
    pickupProof: {
      verifiedAt: Date,
      carrierName: String,
      temperatureC: Number,
      notes: String,
      vehicleNo: String,
    },
    deliveryProof: {
      receiverName: String,
      notes: String,
      deliveredAt: Date,
      verifiedBy: String,
    },
    driverDetails: {
      name: String,
      phone: String,
      vehicleType: String,
      vehicleNumber: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
