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

    // Fixed strictly to 11 buckets (prime number for even distribution)
    private final HashTable inventory = new HashTable(11);

    @PostConstruct
    public void loadData() {
        List<Hardware> items = repository.findAll();
        for (Hardware item : items) {
            inventory.insert(item);
        }
    }

    public Hardware addHardware(Hardware hardware) {

        // Auto-generate ID if blank or null
        if (hardware.getAssetId() == null || hardware.getAssetId().trim().isEmpty()) {
            hardware.setAssetId(generateNextId());
        } else {
            // Prevent duplicate key on manual ID entry
            if (repository.existsById(hardware.getAssetId())) {
                throw new IllegalArgumentException("Hardware with this Asset ID already exists.");
            }
        }

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

        // Keep hash table in sync
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
     * Generates the next available ID by scanning ALL existing IDs in the
     * database (not just the hash table) to avoid three problems:
     *
     * FIX 1 — Gap reuse: deleted IDs are never reused; the next ID is always
     *          max + 1 across the entire database history.
     *
     * FIX 2 — Concurrent requests: reading from the database under a
     *          synchronized block prevents two simultaneous requests from
     *          generating the same ID.
     *
     * FIX 3 — Mixed ID formats: IDs like "HW001" are stripped of their
     *          non-numeric prefix before parsing, so they're included in the
     *          max calculation and won't collide with auto-generated IDs.
     */
    private synchronized String generateNextId() {
        int maxNumber = 0;

        // Read from database — the authoritative source, not just in-memory table
        List<Hardware> allItems = repository.findAll();

        for (Hardware item : allItems) {
            String id = item.getAssetId();
            if (id == null) continue;

            // FIX 3: Strip any leading non-numeric characters (e.g. "HW", "ASSET-")
            // so both "042" and "HW042" contribute 42 to the max calculation.
            String numericPart = id.trim().replaceAll("^[^0-9]+", "");

            if (!numericPart.isEmpty()) {
                try {
                    int current = Integer.parseInt(numericPart);
                    if (current > maxNumber) {
                        maxNumber = current;
                    }
                } catch (NumberFormatException ignored) {
                    // ID has no usable numeric part — skip it
                }
            }
        }

        // Format as zero-padded 3-digit string: "001", "002", ... "999"
        return String.format("%03d", maxNumber + 1);
    }
}