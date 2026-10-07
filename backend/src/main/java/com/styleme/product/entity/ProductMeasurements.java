package com.styleme.product.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ProductMeasurements {

    @Column(name = "frame_width")
    private Integer frameWidth;

    @Column(name = "lens_height")
    private Integer lensHeight;

    @Column(name = "bridge_width")
    private Integer bridgeWidth;

    @Column(name = "temple_length")
    private Integer templeLength;

    public ProductMeasurements() {
    }

    public ProductMeasurements(Integer frameWidth, Integer lensHeight, Integer bridgeWidth, Integer templeLength) {
        this.frameWidth = frameWidth;
        this.lensHeight = lensHeight;
        this.bridgeWidth = bridgeWidth;
        this.templeLength = templeLength;
    }

    public Integer getFrameWidth() {
        return frameWidth;
    }

    public void setFrameWidth(Integer frameWidth) {
        this.frameWidth = frameWidth;
    }

    public Integer getLensHeight() {
        return lensHeight;
    }

    public void setLensHeight(Integer lensHeight) {
        this.lensHeight = lensHeight;
    }

    public Integer getBridgeWidth() {
        return bridgeWidth;
    }

    public void setBridgeWidth(Integer bridgeWidth) {
        this.bridgeWidth = bridgeWidth;
    }

    public Integer getTempleLength() {
        return templeLength;
    }

    public void setTempleLength(Integer templeLength) {
        this.templeLength = templeLength;
    }
}
