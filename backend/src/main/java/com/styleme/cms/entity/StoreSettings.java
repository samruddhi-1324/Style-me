package com.styleme.cms.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "store_settings")
public class StoreSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_name", nullable = false, length = 200)
    private String storeName = "StyleMe Eyewear";

    @Column(name = "support_email", length = 255)
    private String supportEmail = "hello@stylemeeyewear.com";

    @Column(name = "support_phone", length = 50)
    private String supportPhone = "+91 98765 43210";

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Column(nullable = false, length = 20)
    private String locale = "en-IN";

    @Column(name = "time_zone", nullable = false, length = 50)
    private String timeZone = "Asia/Kolkata";

    @Column(name = "free_shipping_threshold", precision = 10, scale = 2)
    private BigDecimal freeShippingThreshold = BigDecimal.ZERO;

    @Column(name = "shipping_policy", columnDefinition = "TEXT")
    private String shippingPolicy;

    @Column(name = "return_policy", columnDefinition = "TEXT")
    private String returnPolicy;

    @Column(name = "privacy_policy", columnDefinition = "TEXT")
    private String privacyPolicy;

    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(name = "announcement_message", columnDefinition = "TEXT")
    private String announcementMessage;

    @Column(name = "contact_address", columnDefinition = "TEXT")
    private String contactAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public StoreSettings() {
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getSupportEmail() {
        return supportEmail;
    }

    public void setSupportEmail(String supportEmail) {
        this.supportEmail = supportEmail;
    }

    public String getSupportPhone() {
        return supportPhone;
    }

    public void setSupportPhone(String supportPhone) {
        this.supportPhone = supportPhone;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public BigDecimal getFreeShippingThreshold() {
        return freeShippingThreshold;
    }

    public void setFreeShippingThreshold(BigDecimal freeShippingThreshold) {
        this.freeShippingThreshold = freeShippingThreshold;
    }

    public String getShippingPolicy() {
        return shippingPolicy;
    }

    public void setShippingPolicy(String shippingPolicy) {
        this.shippingPolicy = shippingPolicy;
    }

    public String getReturnPolicy() {
        return returnPolicy;
    }

    public void setReturnPolicy(String returnPolicy) {
        this.returnPolicy = returnPolicy;
    }

    public String getPrivacyPolicy() {
        return privacyPolicy;
    }

    public void setPrivacyPolicy(String privacyPolicy) {
        this.privacyPolicy = privacyPolicy;
    }

    public String getTermsAndConditions() {
        return termsAndConditions;
    }

    public void setTermsAndConditions(String termsAndConditions) {
        this.termsAndConditions = termsAndConditions;
    }

    public String getAnnouncementMessage() {
        return announcementMessage;
    }

    public void setAnnouncementMessage(String announcementMessage) {
        this.announcementMessage = announcementMessage;
    }

    public String getContactAddress() {
        return contactAddress;
    }

    public void setContactAddress(String contactAddress) {
        this.contactAddress = contactAddress;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
