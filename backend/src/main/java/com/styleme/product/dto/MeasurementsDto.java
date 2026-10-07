package com.styleme.product.dto;

import com.styleme.product.entity.ProductMeasurements;

public class MeasurementsDto {

    private Integer frameWidth;
    private Integer lensHeight;
    private Integer bridgeWidth;
    private Integer templeLength;

    public MeasurementsDto() {
    }

    public MeasurementsDto(Integer frameWidth, Integer lensHeight, Integer bridgeWidth, Integer templeLength) {
        this.frameWidth = frameWidth;
        this.lensHeight = lensHeight;
        this.bridgeWidth = bridgeWidth;
        this.templeLength = templeLength;
    }

    public static MeasurementsDto fromEntity(ProductMeasurements measurements) {
        if (measurements == null) {
            return new MeasurementsDto(140, 45, 18, 145);
        }
        return new MeasurementsDto(
                measurements.getFrameWidth(),
                measurements.getLensHeight(),
                measurements.getBridgeWidth(),
                measurements.getTempleLength()
        );
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
