package org.ankus;

import org.quartz.CronScheduleBuilder;
import org.quartz.CronTrigger;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

@SpringBootApplication
public class AdvanceApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(AdvanceApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        // Quartz Scheduler 시작
        Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
        scheduler.start();

        // Job 생성
        JobDetail job = JobBuilder.newJob(MyJob.class)
                .withIdentity("myJob")
                .build();

        // 크론 트리거 생성 (연도 필드 포함)
        CronTrigger trigger = TriggerBuilder.newTrigger()
                .withIdentity("myTrigger")
                .withSchedule(CronScheduleBuilder.cronSchedule("0/10 * * * * ? 2025")) // 크론 표현식 설정
                .build();

        // Job 실행 스케줄 등록
        scheduler.scheduleJob(job, trigger);
    }
}

