package com.unishare.controller;

import com.unishare.entity.Product;
import com.unishare.entity.PurchaseOrder;
import com.unishare.entity.Student;
import com.unishare.repository.ProductRepository;
import com.unishare.repository.PurchaseOrderRepository;
import com.unishare.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final PurchaseOrderRepository orders;
    private final ProductRepository products;
    private final StudentRepository students;

    public OrderController(PurchaseOrderRepository orders, ProductRepository products, StudentRepository students) {
        this.orders = orders;
        this.products = products;
        this.students = students;
    }

    public record OrderRequest(Long buyerId, Long productId) {}
    public record OrderResponse(Long id, Long buyerId, String buyerName, Long productId,
                                String productTitle, double price, String status, java.time.LocalDateTime createdAt) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse placeOrder(@RequestBody OrderRequest request) {
        if (request.buyerId() == null || request.productId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Buyer and product are required");
        }
        Student buyer = students.findById(request.buyerId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Buyer not found"));
        Product product = products.findById(request.productId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (!"AVAILABLE".equals(product.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Product is no longer available");
        }
        if (product.getSeller().getId().equals(buyer.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot order your own listing");
        }
        product.setStatus("SOLD");
        products.save(product);
        PurchaseOrder order = new PurchaseOrder();
        order.setBuyer(buyer);
        order.setProduct(product);
        order.setStatus("PLACED");
        return response(orders.save(order));
    }

    @GetMapping
    public List<OrderResponse> getOrders(@RequestParam Long buyerId) {
        if (!students.existsById(buyerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        return orders.findByBuyerIdOrderByCreatedAtDesc(buyerId).stream().map(this::response).toList();
    }

    private OrderResponse response(PurchaseOrder o) {
        return new OrderResponse(o.getId(), o.getBuyer().getId(), o.getBuyer().getFullName(),
            o.getProduct().getId(), o.getProduct().getTitle(), o.getProduct().getPrice(),
            o.getStatus(), o.getCreatedAt());
    }
}
