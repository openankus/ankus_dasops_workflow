package org.ankus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class AnkusApplication {

	public static void main(String[] args) {
		SpringApplication.run(AnkusApplication.class, args);
	}

}
