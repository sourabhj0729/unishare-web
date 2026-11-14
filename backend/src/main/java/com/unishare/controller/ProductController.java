package com.unishare.controller;

import com.unishare.entity.Product;
import com.unishare.entity.Student;
import com.unishare.repository.ProductRepository;
import com.unishare.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository products;
    private final StudentRepository students;

    public ProductController(ProductRepository products, StudentRepository students) {
        this.products = products;
        this.students = students;
    }

    public record ProductRequest(String title, String description, double price, String category,
                                 String imageUrl, String listingType, Long sellerId) {}
    public record ProductResponse(Long id, String title, String description, double price, String category,
                                  String imageUrl, String listingType, String status, Long sellerId,
                                  String sellerName, String collegeName) {}

    @GetMapping
    public List<ProductResponse> getProducts(@RequestParam(required=false) String search,
                                               @RequestParam(required=false) String category) {
        List<Product> result;
        if (search != null && !search.isBlank()) {
            result = products.findByTitleContainingIgnoreCaseAndStatus(search.trim(), "AVAILABLE");
        } else if (category != null && !category.isBlank()) {
            result = products.findByCategoryIgnoreCaseAndStatus(category.trim(), "AVAILABLE");
        } else {
            result = products.findByStatusOrderByCreatedAtDesc("AVAILABLE");
        }
        return result.stream().map(this::response).toList();
    }

    @GetMapping("/{id}")
    public ProductResponse getProduct(@PathVariable Long id) {
        return response(products.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found")));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse addProduct(@RequestBody ProductRequest request) {
        if (request.title() == null || request.title().isBlank() ||
            request.category() == null || request.category().isBlank() || request.sellerId() == null ||
            request.price() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title, category, seller and valid price are required");
        }
        Student seller = students.findById(request.sellerId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        Product p = new Product();
        p.setTitle(request.title().trim());
        p.setDescription(request.description());
        p.setPrice(request.price());
        p.setCategory(request.category().trim());
        p.setImageUrl(request.imageUrl());
        p.setListingType(request.listingType() == null ? "SALE" : request.listingType().toUpperCase());
        p.setStatus("AVAILABLE");
        p.setSeller(seller);
        return response(products.save(p));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id, @RequestParam Long sellerId) {
        Product p = products.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (!p.getSeller().getId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the listing owner can delete this product");
        }
        products.delete(p);
    }

    private ProductResponse response(Product p) {
        return new ProductResponse(p.getId(), p.getTitle(), p.getDescription(), p.getPrice(), p.getCategory(),
            p.getImageUrl(), p.getListingType(), p.getStatus(), p.getSeller().getId(),
            p.getSeller().getFullName(), p.getSeller().getCollegeName());
    }
}
