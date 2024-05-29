package org.ankus;

import java.text.SimpleDateFormat;
import java.util.Date;

public class MyJob implements org.quartz.Job {
    public void execute(org.quartz.JobExecutionContext context) {
        System.out.println("Scheduled task executed at " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
    }
}
