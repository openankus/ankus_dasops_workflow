package org.ankus.workflow.controller;

import lombok.extern.slf4j.Slf4j;
import org.ankus.service.UserService;
import org.ankus.workflow.model.*;
import org.ankus.workflow.service.WorkflowSvc;
import org.ankus.util.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Controller
public class WorkflowController {

    @Autowired
    private WorkflowSvc workflowSvc;

    @Autowired
    private UserService userService;
    
    // 워크플로우 등록 페이지 이동
    @RequestMapping(value="workflow")
    public String workflow(){
        return "workflow/wfregister";
    }

    // 워크플로우 수정 페이지 이동
    @RequestMapping(value="workflow_change" , method = RequestMethod.GET)
    public String workflowChange(Model model, @RequestParam long id,@RequestParam(required = false) String url,Principal principal){

        if(url == null) {
            url = "change";
        }
        model.addAttribute("loginId",principal.getName());
        model.addAttribute("name",workflowSvc.getWorkflow(id).getName());
        model.addAttribute("id",id);
        model.addAttribute("url",url);
        return "workflow/wfmodify";
    }
    
    // 워크 플로우 목록 페이지 이동
    @RequestMapping(value="workflow_list" , method = RequestMethod.GET)
    public String workflowList(){
        return "workflow/wflist";
    }

    // 워크플로우 동작 이력 확인 페이지 이동
    @RequestMapping(value="workflow_history", method = RequestMethod.GET)
    public String workflowHistory(@RequestParam long id, RedirectAttributes redirectAttributes,HttpServletRequest request){
//        if(!userService.security_yn(request)) return "redirect:/";
        redirectAttributes.addAttribute("id",id);
        redirectAttributes.addAttribute("url","history");
        return "redirect:workflow_change";
    }

    // 특정 워크플로우 정보 데이터 가져오기
    @PostMapping(value="workflow_select")
    @ResponseBody
    public Workflow workflowSelect(@RequestParam(required = false) long id){
        return workflowSvc.workflowSelect(id);
    }

    // 워크플로우 목록 데이터 가져오기
    @PostMapping(value = "workflow_select_pageable")
    @ResponseBody
    public DataTable workflowSelectPageable(DataTable dto, @RequestBody MultiValueMap<String, String> formData){
        if (formData.size()>50) return workflowSvc.workflowSelectPagealbe(dto,formData);        // 워크플로우 메인 목록(workflow_list)
        else return workflowSvc.workflowReadSelectPagealbe(dto,formData);                       // 워크플로우 read 목록(workflow_list_read)
    }

    // 워크플로우 등록 또는 수정
    @PostMapping(value="workflow_add")
    @ResponseBody
    public long workflowAdd(@RequestBody Workflow workflow, Principal principal){
        workflow.setCreateUser(principal.getName()+"_"+userService.userInfo(principal.getName()).get(0).getName());
        return workflowSvc.registWorkflow(workflow);
    }

    // 특정 워크플로우 동작 이력 정보 목록 데이터
    @RequestMapping(value="workflow_exec_hist_select", method= RequestMethod.POST)
    @ResponseBody
    public DataTable workflowExecHistSelect(DataTable dto, @RequestBody MultiValueMap<String, String> formData){

        int draw = Integer.parseInt(formData.get("draw").get(0));
        int start = Integer.parseInt(formData.get("start").get(0));
        int length = Integer.parseInt(formData.get("length").get(0));

        String column = null;
        if(Integer.parseInt(formData.get("order[0][column]").get(0))==2){
            column="startDateTime";
        }else {
            column="endDateTime";
        }
        String sort = formData.get("order[0][dir]").get(0);


        long id = Integer.parseInt(formData.get("id").get(0));
        Page<WorkflowExecHist> data = workflowSvc.workflowExecHistSelect(id,start,length,column,sort);
        long total = workflowSvc.workflowExecHistSelectTotal(id);

        dto.setDraw(draw);
        dto.setRecordsFiltered((int) total);
        dto.setRecordsTotal((int) total);
        dto.setData(data);
        return dto;
    }

    // 특정 모듈 동작 이력 정보 목록 데이터
    @RequestMapping(value="step_exec_hist_select", method = RequestMethod.POST)
    @ResponseBody
    public DataTable step_exec_hist_select(DataTable dto, @RequestBody MultiValueMap<String, String> formData){
        int draw = Integer.parseInt(formData.get("draw").get(0));
        String column = null;
        if(Integer.parseInt(formData.get("order[0][column]").get(0))==0){
            column="name";
        }else if(Integer.parseInt(formData.get("order[0][column]").get(0))==2){
            column="startDateTime";
        }else {
            column="endDateTime";
        }
        String sort = formData.get("order[0][dir]").get(0);
        List<Object> data = new ArrayList<>();
        if(!formData.get("id").get(0).equals("no_data")) {
            long id = Integer.parseInt(formData.get("id").get(0));
            data = Collections.singletonList(workflowSvc.step_exec_hist_select(id, column, sort));
        }
        dto.setDraw(draw);
        dto.setList(data);
        return dto;
    }

    
    // 특정 워크플로우 배치 활성화 여부
    @PostMapping(value="workflow_flag")
    @ResponseBody
    public Flag workflowFlag(@RequestParam long id, @RequestParam Flag flag){
        return workflowSvc.workflowFlag(id,flag);
    }
    
    // 특정 워크플로우 즉시동작 START
    @PostMapping(value="workflow_run")
    @ResponseBody
    public String workflowRun(@RequestParam Long id){
        return workflowSvc.workflowRun(id, WorkflowExecCause.ON_DEMAND)+"동작";
    }

    // 특정 워크플로우 즉시동작 STOP
    @PostMapping(value="workflow_stop")
    @ResponseBody
    public void workflowStop(@RequestParam Long id){
        workflowSvc.workflowOnDemandStop(id);
    }

    // 특정 워크플로우 목록 삭제
    @PostMapping(value="workflow_delete")
    @ResponseBody
    public void workflowDelete(@RequestParam(value="ids[]") List<Long> ids){
        System.out.println("workflow 삭제");
        workflowSvc.workflowDelete(ids);
        System.out.println("workflow 삭제 완료");
    }

    // 특정 모듈 console 내용 확인
    @PostMapping(value="module_exec_con_out")
    @ResponseBody
    public Map workflowLog(@RequestParam String filePath){
        return workflowSvc.getModuleExecConOut(filePath);
    }

    // 현재 진행중인 워크플로우 동작 확인
    @PostMapping(value = "workflow_onDemandCheck")
    @ResponseBody
    public List<Long> workflowOnDemandCheck(@RequestParam(value="ids[]") List<Long> ids){
        return workflowSvc.getRunningWorkflowIdList(ids);
    }

    // 특정 워크플로우 정보 데이터
    @PostMapping(value = "workflowInfo")
    @ResponseBody
    public Workflow workflowInfo(@RequestParam long id){
        return workflowSvc.workflowInfo(id);
    }

}
