package com.inventory.hardwareinventorysystem.controller;

import com.inventory.hardwareinventorysystem.model.AssetRequest;
import com.inventory.hardwareinventorysystem.model.Hardware;
import com.inventory.hardwareinventorysystem.repository.AssetRequestRepository;
import com.inventory.hardwareinventorysystem.repository.HardwareRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * FIX #1 & #2: Provides the two REST endpoints that app.js expects but that
 * did not exist in the original codebase:
 *
 *   GET  /api/requests/all              — list all requests (manager view)
 *   PUT  /api/requests/{id}/status      — approve or decline a request
 */
@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final AssetRequestRepository assetRequestRepository;
    private final HardwareRepository     hardwareRepository;

    public RequestController(
            AssetRequestRepository assetRequestRepository,
            HardwareRepository hardwareRepository
    ) {
        this.assetRequestRepository = assetRequestRepository;
        this.hardwareRepository     = hardwareRepository;
    }

    /**
     * Returns all asset requests ordered newest-first.
     * Used by the manager's request-review table.
     */
    @GetMapping("/all")
    public List<AssetRequest> getAllRequests() {
        return assetRequestRepository.findAll();
    }

    /**
     * Approve or decline a pending request.
     *
     * Request body:  { "status": "Approved" }  or  { "status": "Declined" }
     *
     * On approval:
     *   - Deducts the requested quantity from the hardware stock.
     *   - Returns 409 if there is insufficient stock.
     *
     * FIX #2: This endpoint was completely absent; the manager's Approve /
     * Decline buttons silently failed (fetch threw a network error).
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateRequestStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String newStatus = body.get("status");

        if (newStatus == null ||
                (!newStatus.equals("Approved") && !newStatus.equals("Declined"))) {
            return ResponseEntity.badRequest()
                    .body("Status must be 'Approved' or 'Declined'.");
        }

        Optional<AssetRequest> optRequest = assetRequestRepository.findById(id);

        if (optRequest.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        AssetRequest request = optRequest.get();

        // Prevent double-processing
        if (!"Pending".equals(request.getStatus())) {
            return ResponseEntity.badRequest()
                    .body("Request has already been processed.");
        }

        if ("Approved".equals(newStatus)) {
            // FIX #2: Deduct stock when approving.
            Hardware hardware =
                    hardwareRepository.findById(request.getAssetId()).orElse(null);

            if (hardware == null) {
                return ResponseEntity.badRequest()
                        .body("Asset no longer exists in inventory.");
            }

            if (hardware.getQuantity() < request.getQuantity()) {
                return ResponseEntity.status(409)
                        .body("Insufficient stock. Available: "
                                + hardware.getQuantity()
                                + ", Requested: " + request.getQuantity());
            }

            hardware.setQuantity(hardware.getQuantity() - request.getQuantity());
            hardwareRepository.save(hardware);
        }

        request.setStatus(newStatus);
        assetRequestRepository.save(request);

        return ResponseEntity.ok("Request " + newStatus.toLowerCase() + " successfully.");
    }
}