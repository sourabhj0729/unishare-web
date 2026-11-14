package com.unishare.repository;
import com.unishare.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ProductRepository extends JpaRepository<Product,Long> {
 List<Product> findByStatusOrderByCreatedAtDesc(String status);
 List<Product> findByTitleContainingIgnoreCaseAndStatus(String title,String status);
 List<Product> findByCategoryIgnoreCaseAndStatus(String category,String status);
}