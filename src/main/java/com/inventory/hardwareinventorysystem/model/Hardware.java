package com.inventory.hardwareinventorysystem.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/**
 * Represents a hardware inventory item.
 */
@Entity
public class Hardware {

    @Id
    private String assetId;

    private String name;
    private String category;
    private int quantity;

    public Hardware() {
    }

    public Hardware(String assetId, String name, String category, int quantity) {
        this.assetId = assetId;
        this.name = name;
        this.category = category;
        this.quantity = quantity;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}