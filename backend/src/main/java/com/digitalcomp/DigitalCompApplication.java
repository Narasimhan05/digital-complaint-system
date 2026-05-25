package com.digitalcomp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DigitalCompApplication {

    public static void main(String[] args) {
        SpringApplication.run(DigitalCompApplication.class, args);
    }
}
