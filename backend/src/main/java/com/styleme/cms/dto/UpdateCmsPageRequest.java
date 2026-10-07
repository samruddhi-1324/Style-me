package com.styleme.cms.dto;

import com.styleme.cms.entity.CmsPageStatus;
import com.styleme.cms.entity.PageType;

public class UpdateCmsPageRequest {

    private String slug;
    private PageType pageType;
    private String title;
    private String summary;
    private String content;
    private String seoTitle;
    private String metaDescription;
    private CmsPageStatus status;
    private Boolean showInNavigation;

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public PageType getPageType() {
        return pageType;
    }

    public void setPageType(PageType pageType) {
        this.pageType = pageType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSeoTitle() {
        return seoTitle;
    }

    public void setSeoTitle(String seoTitle) {
        this.seoTitle = seoTitle;
    }

    public String getMetaDescription() {
        return metaDescription;
    }

    public void setMetaDescription(String metaDescription) {
        this.metaDescription = metaDescription;
    }

    public CmsPageStatus getStatus() {
        return status;
    }

    public void setStatus(CmsPageStatus status) {
        this.status = status;
    }

    public Boolean getShowInNavigation() {
        return showInNavigation;
    }

    public void setShowInNavigation(Boolean showInNavigation) {
        this.showInNavigation = showInNavigation;
    }
}
