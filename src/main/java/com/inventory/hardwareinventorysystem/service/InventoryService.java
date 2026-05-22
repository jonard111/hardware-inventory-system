package com.inventory.hardwareinventorysystem.service;

import com.inventory.hardwareinventorysystem.datastructure.HashTable;
import com.inventory.hardwareinventorysystem.model.Hardware;
import com.inventory.hardwareinventorysystem.repository.HardwareRepository;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.LinkedList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {

    @Autowired
    private HardwareRepository repository;

    // Fixed strictly to 11 buckets as suggested by your instructor
    private final HashTable inventory = new HashTable(11);

    @PostConstruct
    public void loadData() {
        List<Hardware> items = repository.findAll();
        for (Hardware item : items) {
            inventory.insert(item);
        }
    }

    public Hardware addHardware(Hardware hardware) {
        // Step 1: Auto-generate plain numeric ID if blank or null
        if (hardware.getAssetId() == null || hardware.getAssetId().trim().isEmpty()) {
            hardware.setAssetId(generateNextId());
        } else {
            // Guard rule for manual additions: prevent duplicate key overwrites
            if (repository.existsById(hardware.getAssetId())) {
                throw new IllegalArgumentException("Hardware with this Asset ID already exists.");
            }
        }

        // Step 2: Save to Database and inject into your 11-bucket visual structure
        Hardware saved = repository.save(hardware);
        inventory.insert(saved);
        return saved;
    }

    public Hardware searchHardware(String assetId) {
        return inventory.search(assetId);
    }

    public String updateHardware(String assetId, Hardware updated) {
        Hardware existing = repository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found: " + assetId));

        existing.setName(updated.getName());
        existing.setCategory(updated.getCategory());
        existing.setQuantity(updated.getQuantity());

        repository.save(existing);

        // Sync local static hash rows
        inventory.delete(assetId);
        inventory.insert(existing);

        return "Asset updated successfully.";
    }

    public boolean deleteHardware(String assetId) {
        if (inventory.delete(assetId)) {
            repository.deleteById(assetId);
            return true;
        }
        return false;
    }

    public Object getBuckets() {
        return inventory.getTable();
    }

    public double getLoadFactor() {
        return inventory.getLoadFactor();
    }

    public int getBucketSize() {
        return inventory.getSize();
    }

    public int getItemCount() {
        return inventory.getItemCount();
    }

    /**
     * Scans through all 11 chains to evaluate the highest plain number used.
     */
    private String generateNextId() {
        int maxNumber = 0;
        
        for (LinkedList<Hardware> bucket : inventory.getTable()) {
            for (Hardware item : bucket) {
                String id = item.getAssetId();
                if (id != null) {
                    try {
                        // Directly parse the entire string as a pure integer (e.g., "042" -> 42)
                        int currentNum = Integer.parseInt(id.trim());
                        if (currentNum > maxNumber) {
                            maxNumber = currentNum;
                        }
                    } catch (NumberFormatException ignored) {
                        // Skip comfortably if an old legacy ID with text is encountered
                    }
                }
            }
        }
        
        // Formats to 3 digits padded with leading zeros (e.g., "001", "002", "015")
        return String.format("%03d", maxNumber + 1);
    }
}