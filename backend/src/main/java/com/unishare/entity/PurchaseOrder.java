package com.unishare.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "buyer_id", nullable = false)
    private Student buyer;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    @Column(nullable = false) private String status = "PLACED";
    @Column(nullable = false) private LocalDateTime createdAt = LocalDateTime.now();

    public PurchaseOrder() {}
    public Long getId() { return id; }
    public Student getBuyer() { return buyer; }
    public void setBuyer(Student buyer) { this.buyer = buyer; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
