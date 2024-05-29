package org.ankus.advance;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronTrigger;

import javax.annotation.PostConstruct;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

@SpringBootTest
class AdvanceApplicationTests {

	@Autowired
	private TaskScheduler taskScheduler;

	@PostConstruct
	public void scheduleTaskWithCronExpression() {
		String cronExpression = "0/10 * * * * *";
		taskScheduler.schedule(this::task, new CronTrigger(cronExpression, TimeZone.getTimeZone(TimeZone.getDefault().getID())));
	}

	public void task() {
		System.out.println("Scheduled task executed at " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
	}

	@Test
	void contextLoads() throws InterruptedException {
		// Run the scheduler for a few minutes to see the output
		Thread.sleep(120000); // Sleep for 2 minutes
	}
}
