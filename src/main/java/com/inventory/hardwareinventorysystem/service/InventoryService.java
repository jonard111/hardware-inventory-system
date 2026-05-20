package com.inventory.hardwareinventorysystem.service;

import com.inventory.hardwareinventorysystem.datastructure.HashTable;
import com.inventory.hardwareinventorysystem.model.Hardware;
import com.inventory.hardwareinventorysystem.repository.HardwareRepository;
import jakarta.annotation.PostConstruct;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Handles inventory operations and synchronizes
 * database storage with in-memory hash table.
 */
@Service
public class InventoryService {

    @Autowired
    private HardwareRepository repository;

    // Separate Chaining HashTable
    private final HashTable inventory = new HashTable(10);

    /**
     * Loads existing database records into the hash table
     * when the application starts.
     */
    @PostConstruct
    public void loadData() {
        List<Hardware> items = repository.findAll();

        for (Hardware item : items) {
            inventory.insert(item);
        }
    }

    /**
     * Adds hardware to database and hash table.
     */
    public Hardware addHardware(Hardware hardware) {

        // Check if asset ID already exists in database
        if (repository.existsById(hardware.getAssetId())) {
            throw new IllegalArgumentException("Hardware with this Asset ID already exists.");
        }

        // Save to database
        Hardware saved = repository.save(hardware);

        // Insert into hash table
        inventory.insert(saved);

        return saved;
    }

    /**
     * Searches hardware using hash table lookup.
     */
    public Hardware searchHardware(String assetId) {
        return inventory.search(assetId);
    }

    /**
     * Deletes hardware from database and hash table.
     */
    public boolean deleteHardware(String assetId) {

        if (inventory.delete(assetId)) {
            repository.deleteById(assetId);
            return true;
        }

        return false;
    }

    /**
     * Returns bucket structure for visualization.
     */
    public Object getBuckets() {
        return inventory.getTable();
    }

    /**
     * Returns current load factor.
     */
    public double getLoadFactor() {
        return inventory.getLoadFactor();
    }

    /**
     * Returns total number of buckets.
     */
    public int getBucketSize() {
        return inventory.getSize();
    }

    /**
     * Returns total stored items.
     */
    public int getItemCount() {
        return inventory.getItemCount();
    }
}