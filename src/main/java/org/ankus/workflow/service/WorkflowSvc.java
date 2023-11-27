package org.ankus.workflow.service;

import lombok.extern.slf4j.Slf4j;
import org.ankus.workflow.model.*;
import org.ankus.workflow.repository.ModuleExecConfRepsitory;
import org.ankus.workflow.repository.WorkflowRepository;
import org.ankus.workflow.repository.WorkflowStepRepository;
import org.ankus.util.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.ankus.workflow.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.io.*;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@Transactional
public class WorkflowSvc {

    /**
     * 워크플로우 데이터 접근 객체
     */
    @Autowired
    WorkflowRepository workflowRepository;

    /**
     * 워크플로우 단계 데이터 접근 객체
     */
    @Autowired
    WorkflowStepRepository workflowStepRepository;

    /**
     * 모듈파일 실행설정 데이터 접근 객체
     */
    @Autowired
    ModuleExecConfRepsitory moduleExecConfRepsitory;

    /**
     * Entity 관리자
     */
    @Autowired
    EntityManager entityManager;

    /**
     * 워크플로우 실행 관리자
     */
    @Autowired
    WorkflowExecManager workflowExecManager;


    /**
     * 파이썬 유틸 객체
     */
    @Autowired
    PythonUtil pythonUtil;

    /**
     * workflow 로그
     */
    @Autowired
    WorkflowExecHistRespository workflowExecHistRespository;

    /**
     * workflow step 로그
     */
    @Autowired
    WorkflowStepExecHistRepository workflowStepExecHistRepository;

    /**
     * module 로그 queryDSL
     */
    @Autowired
    ModuleExecHistRepositorySupport moduleExecHistRepositorySupport;

    @Autowired
    WorkflowRepositorySupport workflowRepositorySupport;

    /**
     * module 실행 이력 데이터 접근 객체
     */
    @Autowired
    ModuleExecHistRepository moduleExecHistRepository;


    @Autowired
    WorkflowExecHistRepositorySupport workflowExecHistRepositorySupport;


    public WorkflowSvc(){
    }



    /**
     * 워크플로우 정보 등록
     * 
     * @param workflow 워크플로우 정보
     * @return
     */
    public Long saveWorkflow(Workflow workflow) {
        workflowRepository.save(workflow);
        return workflow.getId();
    }



    /**
     * 워크플로우를 등록
     *
     * @param workflow 워크플로우명
     * @return 등록된 워크플로우의 ID
     *
     */
    public Long registWorkflow(Workflow workflow) {
        Long result = workflowRepository.save(workflow).getId();
        return result;
    }



    /**
     * 워크플로우 목록을 반환
     *
     * @param subName 워크플로우 이름의 일부
     * @param pageRequest 페이지 요청 정보
     * @return 워크플로우 목록
     */
    public Page<Workflow> listWorkflow(String subName, PageRequest pageRequest){
        return workflowRepository.findByNameContaining(subName, pageRequest);
    }

    /**
     * 워크플로우 반환
     *
     * @param workflowId 워크플로우 ID
     * @return 워크플로우
     */
    public Workflow getWorkflow(Long workflowId){
        return workflowRepository.getById(workflowId);
    }



    public Page<WorkflowExecHist> workflowExecHistSelect(long id, int start, int length, String column, String sort){
        return workflowRepositorySupport.workflowExecHistList(id,start,length,column,sort);
    }

    public long workflowExecHistSelectTotal(long id){
        return workflowRepositorySupport.workflowExecHistListTotal(id);
    }

    public List<ModuleExecHist> step_exec_hist_select(long id,String column,String sort) {
        return moduleExecHistRepositorySupport.moduleExecHistSelect(id,column,sort);
    }

    public Workflow workflowSelect(long id) {
        return workflowRepository.findById(id);
    }

    public DataTable workflowSelectPagealbe(DataTable dto, MultiValueMap<String, String> formData){
        int draw = Integer.parseInt(formData.get("draw").get(0));
        int start = Integer.parseInt(formData.get("start").get(0));
        int length = Integer.parseInt(formData.get("length").get(0));

        String column = null;
        if(Integer.parseInt(formData.get("order[0][column]").get(0))==5){
            column="createUser";
        }else if(Integer.parseInt(formData.get("order[0][column]").get(0))==1){
            column="name";
        }else if(Integer.parseInt(formData.get("order[0][column]").get(0))==6){
            column="updateDateTime";
        }
        String sort = formData.get("order[0][dir]").get(0);


        String state = null;

        if(!formData.get("columns[5][search][value]").get(0).equals("")){
            state="createUser";
        }else if(!formData.get("columns[1][search][value]").get(0).equals("")){
            state="name";
        }else{
            state="*";
        }
        String text = formData.get("columns[1][search][value]").get(0)+formData.get("columns[5][search][value]").get(0);
        String udate = formData.get("columns[6][search][value]").get(0);
        udate = udate.equals("") ? LocalDate.now().minusYears(1)+" "+ LocalDate.now() : udate;
        Page<Workflow> data = workflowRepositorySupport.list(start, length, column, sort, state, text, udate);
        long total = workflowRepositorySupport.total(state,text,udate);

//        for(int i=0;i<data.getContent().size();i++){
//            if(i%2==0) data.getContent().get(i).setRun("N");
//            else data.getContent().get(i).setRun("Y");
//        }
        dto.setDraw(draw);
        dto.setRecordsFiltered((int) total);
        dto.setRecordsTotal((int) total);
        dto.setData(data);
        dto.setUdate(udate);
        return dto;
    }

    public DataTable workflowReadSelectPagealbe(DataTable dto, MultiValueMap<String, String> formData){
        System.out.println(formData);
        int draw = Integer.parseInt(formData.get("draw").get(0));
        int start = Integer.parseInt(formData.get("start").get(0));
        int length = Integer.parseInt(formData.get("length").get(0));

        String column = null;
        if(Integer.parseInt(formData.get("order[0][column]").get(0))==2){
            column="createUser";
        }else if(Integer.parseInt(formData.get("order[0][column]").get(0))==0){
            column="name";
        }else if(Integer.parseInt(formData.get("order[0][column]").get(0))==3){
            column="updateDateTime";
        }
        String sort = formData.get("order[0][dir]").get(0);


        String state = null;

        if(!formData.get("columns[2][search][value]").get(0).equals("")){
            state="createUser";
        }else if(!formData.get("columns[0][search][value]").get(0).equals("")){
            state="name";
        }else{
            state="*";
        }
        String text = formData.get("columns[2][search][value]").get(0)+formData.get("columns[0][search][value]").get(0);
        String udate = formData.get("columns[3][search][value]").get(0);
        udate = udate.equals("") ? LocalDate.now().minusYears(1)+" "+ LocalDate.now() : udate;
        Page<Workflow> data = workflowRepositorySupport.list(start, length, column, sort, state, text, udate);
        long total = workflowRepositorySupport.total(state,text,udate);

//        for(int i=0;i<data.getContent().size();i++){
//            if(i%2==0) data.getContent().get(i).setRun("N");
//            else data.getContent().get(i).setRun("Y");
//        }
        dto.setDraw(draw);
        dto.setRecordsFiltered((int) total);
        dto.setRecordsTotal((int) total);
        dto.setData(data);
        dto.setUdate(udate);
        return dto;
    }

    public Flag workflowFlag(long id, Flag flag) {
        Workflow workflow = workflowRepository.getById(id);
        workflow.setActFlag(flag);

        return workflowRepository.save(workflow).getActFlag();
    }

    /**
     * 워크플로우 삭제
     * @param{List<Long>} id
     */
    public void workflowDelete(List<Long> id){
        for(int i=0;i<id.size();i++){
            System.out.println(id.get(i));
            workflowRepository.deleteById(id.get(i));
        }
    }

    /**
     * 모듈 실행이력의 콘솔 출력값 반환
     *
     * @return
     */
    public Map getModuleExecConOut(String filePath){

        StringBuffer sb = new StringBuffer();


        try{
            //  콘솔출력 파일 스트림 열기
            FileReader fr = new FileReader(filePath);
            BufferedReader br = new BufferedReader(fr);

            //  문자열 만들기
            String rl = br.readLine();
            while (rl != null){
                sb.append(rl);
                sb.append("\n");
                rl = br.readLine();
            }
        }catch (FileNotFoundException e){
            log.warn("모듈실행의 콘솔출력 결과파일이 존재하지 않음",e);
            Map<String,String> map = new HashMap<>();
            map.put("result","error");
            map.put("content","결과파일이 존재하지 않음");
            return map;
        }catch (IOException e){
            log.warn("모듈실행의 콘솔출력 결과파일을 로드 중 에러",e);
        }
        Map<String,String> map = new HashMap<>();
        map.put("result","success");
        map.put("content",sb.toString());
        return  map;
    }


    /**
     * 워크플로우 실행 요청
     * 
     * @param id    workflow ID
     * @param cause 실행 원인
     * @return  실행되는 워크플로우 이름
     */
    public String workflowRun(Long id, WorkflowExecCause cause) {
        workflowExecManager.requestWorkflowRun(id, cause);
        Workflow workflow = workflowRepository.getById(id);
        return workflow.getName();
    }


    public void workflowOnDemandStop(long id){
        workflowExecManager.requestWorkflowStop(id);
    }

    public Workflow workflowInfo(long id){
        return workflowRepository.findById(id);
    }


    /**
     * 이벤트 청취 기반 워크플로우 실행 요청
     *
     * @param eventName 이벤트 이름
     */
    public void requestEventListenWorkflowExec(String eventName){
        List<ExecCondType> execCondTypeList = new ArrayList<ExecCondType>();
        execCondTypeList.add(ExecCondType.EVENT_LISTEN);
        List<Workflow> workflowList = workflowRepository.findByActFlagAndExecCondTypeIn(Flag.Y, execCondTypeList);



        for (Workflow workflow : workflowList){

            if (eventName != null && eventName.equals(workflow.getExecCondEventName())){

                workflowExecManager.requestWorkflowRun(
                        workflow.getId(), WorkflowExecCause.EVENT_LISTEN);
            }
        }
        
    }


    /**
     * 실행 중인 workflow ID 목록 반환
     *
     * @param idList 점검할 workflow ID 목록
     * @return
     */
    public List<Long> getRunningWorkflowIdList(List<Long> idList){
        List<Long> retList = new ArrayList<Long>();

        Set<Long> workflowIdSet = workflowExecManager.getRunningWorkflowIdSet();
        for (Long id : idList){
            if (workflowIdSet.contains(id)){
                retList.add(id);
            }
        }

        return  retList;
    }

    /**
     * 실행 중인 workflow ID 집합을 반환
     *
     * @return workflow ID 집합
     */
    public Set<Long> getAllRunningWorkflowIdSet(){
        return workflowExecManager.getRunningWorkflowIdSet();
    }


    /**
     * 워크플로우 목록을 반환
     *
     * @param subName 워크플로우 이름 검색어
     * @return
     */
    public List<Workflow> listWorkflows(String subName){
        return workflowRepository.findWorkflowsByNameContaining(subName);
    }

    /**
     * 워크플로우의 실행여부를 반환
     *
     * @param workflowId 확인할 워크플로우의 ID
     * @return 워크플로우의 실행여부
     */
    public boolean isRunningWorkflow(Long workflowId){
        return workflowExecManager.getRunningWorkflowIdSet().contains(workflowId);
    }

    /**
     * 워크플로우의 최근 실행이력들을 반환
     *
     * @param workflowId 워크플로우 ID
     * @param limit 워프플로우 이력 개수
     * @return
     */
    public List<WorkflowExecHist> getRecentWorkflowExecHistList(Long workflowId, Long limit){

        // 수정할 것!!!!!
        List<WorkflowExecHist> workflowExecHistList = workflowExecHistRepositorySupport.getRecentWorkflowExecHistList(workflowId, limit);

        return  workflowExecHistList;
    }


    public String getConOutText(Long moduleExecHistId, Integer lineCount) throws FileNotFoundException, IOException{
        ModuleExecHist moduleExecHist = moduleExecHistRepository.getById(moduleExecHistId);

        // 1. RandomAcessFile, 마지막 라인을 담을 String, 읽을 라인 수
        RandomAccessFile randomAccessFile = new RandomAccessFile(moduleExecHist.getConOutFilePath(), "r");
        StringBuffer lastLine = new StringBuffer();

        // 2. 전체 파일 길이
        long fileLength = randomAccessFile.length();

        // 3. 포인터를 이용하여 뒤에서부터 앞으로 데이터를 읽는다.
        for (long pointer = fileLength - 1; pointer >= 0; pointer--) {

            // 3.1. pointer를 읽을 글자 앞으로 옮긴다.
            randomAccessFile.seek(pointer);

            // 3.2. pointer 위치의 글자를 읽는다.
            char c = (char) randomAccessFile.read();

            // 3.3. 줄바꿈이 3번(lineCount) 나타나면 더 이상 글자를 읽지 않는다.
            if (c == '\n') {
                lineCount--;
                if (lineCount == 0) {
                    break;
                }
            }

            // 3.4. 결과 문자열의 앞에 읽어온 글자(c)를 붙여준다.
            lastLine.insert(0, c);
        }


        // 4. OS에 따른 문자열 인코딩 적용
        String os = System.getProperty("os.name").toLowerCase();
        String conOutText = null;
        if (os.contains("win")) {
            conOutText = new String(lastLine.toString().getBytes("ISO-8859-1"), "UTF-8");
        }else{
            conOutText = lastLine.toString();
        }

        return conOutText;
    }

}
