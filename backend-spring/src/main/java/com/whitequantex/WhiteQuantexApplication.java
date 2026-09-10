package com.whitequantex;

import com.whitequantex.business.entity.BusinessEntity;
import com.whitequantex.business.repository.BusinessRepository;
import com.whitequantex.users.entity.UserEntity;
import com.whitequantex.users.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.socket.config.annotation.EnableWebSocket;

import java.math.BigDecimal;
import java.util.UUID;

@SpringBootApplication
@EnableWebSocket
@EnableScheduling
public class WhiteQuantexApplication {

    public static void main(String[] args) {
        SpringApplication.run(WhiteQuantexApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, BusinessRepository businessRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                UserEntity demoUser = UserEntity.builder()
                        .email("alex@venture.com")
                        .passwordHash(passwordEncoder.encode("password123"))
                        .firstName("Alexander")
                        .lastName("Vance")
                        .displayName("Alexander Vance")
                        .username("alexvance")
                        .headline("Founder & CEO @ Quantum Systems")
                        .bio("Building quantum computing infrastructure for decentralized systems.")
                        .primaryRole("FOUNDER")
                        .verificationLevel("GOLD")
                        .kycStatus("APPROVED")
                        .trustScore(94)
                        .build();
                userRepository.save(demoUser);

                if (businessRepository.count() == 0) {
                    BusinessEntity startup = BusinessEntity.builder()
                            .ownerId(demoUser.getId())
                            .type("STARTUP")
                            .name("Quantum AI Systems")
                            .tagline("Next-gen quantum neural networks")
                            .description("Developing scalable fault-tolerant quantum algorithms for quantitative finance.")
                            .industry("Deep Tech / Quantum")
                            .stage("SEED")
                            .location("San Francisco, CA")
                            .website("https://quantumsystems.ai")
                            .verificationLevel("GOLD")
                            .trustScore(92)
                            .fundingRaised(new BigDecimal("2500000"))
                            .valuation(new BigDecimal("18000000"))
                            .build();

                    BusinessEntity company = BusinessEntity.builder()
                            .ownerId(demoUser.getId())
                            .type("EXISTING_COMPANY")
                            .name("Aether Financial Ltd")
                            .tagline("Institutional algorithmic liquidity platform")
                            .description("Providing high-frequency liquidity solutions and cross-border settlement rails.")
                            .industry("Fintech / Liquidity")
                            .stage("GROWTH")
                            .location("New York, NY")
                            .website("https://aetherfin.com")
                            .verificationLevel("PLATINUM")
                            .trustScore(97)
                            .fundingRaised(new BigDecimal("15000000"))
                            .valuation(new BigDecimal("95000000"))
                            .build();

                    businessRepository.save(startup);
                    businessRepository.save(company);
                }
            }
        };
    }
}
