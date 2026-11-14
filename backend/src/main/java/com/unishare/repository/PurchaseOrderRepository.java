package com.unishare.repository;

import com.unishare.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
}
