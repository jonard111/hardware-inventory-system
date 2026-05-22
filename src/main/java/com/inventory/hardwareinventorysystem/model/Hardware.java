package com.inventory.hardwareinventorysystem.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Represents a hardware inventory item.
 *
 * No logic changes from the original — Hardware had no missing fields.
 * @Table added so the table name is explicit and won't vary by JPA dialect.
 */
@Entity
@Table(name = "hardware")
public class Hardware {

    @Id
    private String assetId;

    private String name;
    private String category;
    private int    quantity;

    public Hardware() {}

    public Hardware(String assetId, String name, String category, int quantity) {
        this.assetId   = assetId;
        this.name      = name;
        this.category  = category;
        this.quantity  = quantity;
    }

    public String getAssetId() { return assetId; }
    public void   setAssetId(String assetId) { this.assetId = assetId; }

    public String getName() { return name; }
    public void   setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void   setCategory(String category) { this.category = category; }

    public int  getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}