package com.whitequantex.company;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class CompanyBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CompanyBackendApplication.class, args);
    }
}
