package com.unishare.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="products")
public class Product {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private String title;
 @Column(length=2000) private String description;
 @Column(nullable=false) private double price;
 @Column(nullable=false) private String category;
 private String imageUrl;
 @Column(nullable=false) private String listingType="SALE";
 @Column(nullable=false) private String status="AVAILABLE";
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="seller_id",nullable=false) private Student seller;
 @Column(nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
 public Product(){}
 public Long getId(){return id;}
 public String getTitle(){return title;} public void setTitle(String v){title=v;}
 public String getDescription(){return description;} public void setDescription(String v){description=v;}
 public double getPrice(){return price;} public void setPrice(double v){price=v;}
 public String getCategory(){return category;} public void setCategory(String v){category=v;}
 public String getImageUrl(){return imageUrl;} public void setImageUrl(String v){imageUrl=v;}
 public String getListingType(){return listingType;} public void setListingType(String v){listingType=v;}
 public String getStatus(){return status;} public void setStatus(String v){status=v;}
 public Student getSeller(){return seller;} public void setSeller(Student v){seller=v;}
 public LocalDateTime getCreatedAt(){return createdAt;}
}