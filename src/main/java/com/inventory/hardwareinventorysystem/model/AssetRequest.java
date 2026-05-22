package com.inventory.hardwareinventorysystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "asset_requests")
public class AssetRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String assetId;
    private String assetName;

    // FIX: Added missing field.
    // StaffController calls request.setCategory(...) and staff-dashboard.html
    // renders ${r.category} — without this column the app throws a
    // SpelEvaluationException and the staff dashboard page crashes at runtime.
    private String category;

    private String requestedBy;
    private int    quantity;
    private String purpose;
    private String status;

    // FIX: Added missing field.
    // StaffController calls request.setDateCreated(...) and staff-dashboard.html
    // renders ${r.dateCreated} — same crash as above without this field.
    // Stored as a formatted String (e.g. "2026-05-21 14:30") so Thymeleaf
    // can render it directly without a custom formatter.
    private String dateCreated;

    public AssetRequest() {}

    // ── Getters & Setters ──────────────────────────────────────────────────

    public Long getId() { return id; }

    public String getAssetId() { return assetId; }
    public void   setAssetId(String assetId) { this.assetId = assetId; }

    public String getAssetName() { return assetName; }
    public void   setAssetName(String assetName) { this.assetName = assetName; }

    public String getCategory() { return category; }
    public void   setCategory(String category) { this.category = category; }

    public String getRequestedBy() { return requestedBy; }
    public void   setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public int  getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getPurpose() { return purpose; }
    public void   setPurpose(String purpose) { this.purpose = purpose; }

    public String getStatus() { return status; }
    public void   setStatus(String status) { this.status = status; }

    public String getDateCreated() { return dateCreated; }
    public void   setDateCreated(String dateCreated) { this.dateCreated = dateCreated; }
}