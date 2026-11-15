package com.whitequantex.kyc.dto;

import lombok.Data;

@Data
public class KycSubmitRequest {
    private String legalFirstName;
    private String legalLastName;
    private String dateOfBirth;
    private String residentialAddress;
    private String city;
    private String stateProvince;
    private String postalCode;
    private String country;
    private String nationality;
    private String idType; // PAN_CARD, NATIONAL_ID, PASSPORT, DRIVERS_LICENSE
    private String idNumber;
    private String phoneNumber;
    private String documentType;
    private String documentFileName;
    private String documentStoragePath;
    private String documentMimeType;
    private Long documentFileSize;
    private String proofOfAddressFileName;
    private String proofOfAddressStoragePath;
    private Boolean declarationAccepted;
    private Boolean consentAccepted;
    private Boolean isDraft;
}
