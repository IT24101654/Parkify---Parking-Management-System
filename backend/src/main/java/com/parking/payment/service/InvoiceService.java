package com.parking.payment.service;

import com.parking.payment.entity.Invoice;
import com.parking.payment.entity.Payment;
import com.parking.payment.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    public Invoice generateInvoice(Payment payment) {
        if (invoiceRepository.findByPaymentId(payment.getId()).isPresent()) {
            return invoiceRepository.findByPaymentId(payment.getId()).get();
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        invoice.setPayment(payment);
        
        // Mock Tax Calculation (e.g. 5% service tax)
        BigDecimal totalAmount = payment.getAmount();
        BigDecimal subtotal = totalAmount.divide(BigDecimal.valueOf(1.05), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal tax = totalAmount.subtract(subtotal);

        invoice.setSubtotal(subtotal);
        invoice.setTax(tax);
        invoice.setTotalAmount(totalAmount);

        return invoiceRepository.save(invoice);
    }

    public Invoice getInvoiceByPayment(Long paymentId) {
        return invoiceRepository.findByPaymentId(paymentId).orElse(null);
    }
}
