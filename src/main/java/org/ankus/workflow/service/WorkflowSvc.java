package org.ankus.workflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.ankus.file.service.FileManageSvc;
import org.ankus.workflow.model.*;
import org.ankus.workflow.repository.ModuleExecConfRepsitory;
import org.ankus.workflow.repository.WorkflowRepository;
import org.ankus.workflow.repository.WorkflowStepRepository;
import org.ankus.util.DataTable;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.ankus.workflow.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;
import org.zeroturnaround.zip.ZipUtil;

import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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


    /**
     * 워크플로우 실행이력 데이터 접근 객체
     */
    @Autowired
    WorkflowExecHistRepositorySupport workflowExecHistRepositorySupport;

    /**
     * 파일 관리 서비스 객체
     */
    @Autowired
    FileManageSvc fileManageSvc;


    /**
     * 사용자 작업공간 디렉터리
     */
    @Value("${ankus.jupyter.workspace}")
    private String ankusUserWorkspace;



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
     * 워크플로우들을 복사하여 생성
     *
     * @param ids 복사할 워크플로우들의 ID 목록
     * @param copyUser 복사하는 사용자의 ID
     */
    public void workflowCopy(List<Long> ids, String copyUser){

        for (Long id : ids){
            // 복사할 워크플로우 정보 로드
            Workflow workflow = workflowRepository.getById(id);

            // 복사 워크플로우 생성
            Workflow copyWorkflow = this.copy(workflow);
            copyWorkflow.setName(
                    workflow.getName()+" - 복사본"+DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDateTime.now()));

            //  복사한 워크플로우 저장
            workflowRepository.save(copyWorkflow);
        }
    }


    /**
     * 워크플로우들을 내보내기
     *
     * @param ids 복사할 워크플로우들의 ID 목록
     * @param withOtherFile 동일 디렉터리내에 있는 다른 파일 및 폴더들도 포함할 할지 여부
     * @return 내보내기용 zip 파일의 경로
     */
    public String workflowExport(List<Long> ids, Boolean withOtherFile) throws IOException{

        //  export 파일을 만들기 위한 임시 디렉토리 생성
        Path workflowExportDir = Files.createTempDirectory("workflow_export_");

        //---<모듈파일을 복사>---
        {
            //---<모듈파일 경로 목록 추출>----
            Set<String> filePathSet = new HashSet<String>();
            //  모듈파일 경로 수집
            for (Long id : ids) {
                Workflow workflow = workflowRepository.getById(id);
                for (WorkflowStep workflowStep : workflow.getWorkflowStepList()) {
                    for (ModuleExecConf moduleExecConf : workflowStep.getModuleExecConfList()){
                        filePathSet.add(moduleExecConf.getModuleFilePath());
                    }
                }
            }
            if (withOtherFile){
                //  동일 디렉터리내에 있는 다른 파일 및 폴더들도 포함
                File ankusWorkspaceDir = new File(ankusUserWorkspace);
                for (String filePath : new ArrayList<String>(filePathSet)){
                    File file = new File(ankusUserWorkspace, filePath);
                    int rootPathLength = ankusWorkspaceDir.getAbsolutePath().length();
                    for (File brotherFile: file.getParentFile().listFiles()){
                        filePathSet.add(brotherFile.getAbsolutePath().substring(rootPathLength));
                    }
                }
            }
            
            List<String> filePathList  = new ArrayList<String>();
            filePathList.addAll(filePathSet);
            //---</모듈파일 경로 목록 추출>----

            //  모듈 파일들을 담을 디렉토리 생성
            File moduleFileDir = new File(workflowExportDir.toAbsolutePath().toString(), "module_file");
            moduleFileDir.mkdirs();
            // file들을 담을 임시 디렉토리를 생성
            for (String filePath : filePathList){
                File fromFile = new File(ankusUserWorkspace, filePath);
                File toFile = new File(moduleFileDir, filePath);
                // 파일이 담겨져 있는 하위 디렉터리 생성
                toFile.getParentFile().mkdirs();
                // 파일복사 생성
                if (fromFile.isDirectory()){
                    FileUtils.copyDirectory(fromFile, toFile);
                }else{
                    FileUtils.copyFile(fromFile, toFile, StandardCopyOption.REPLACE_EXISTING);
                }
            }
        }
        //---</모듈파일을 복사>---

        //---<워크플로우 목록을 직렬화 저장>---
        {
            //---<워크플로우 목록 추출>----
            List<Workflow> exportWorkflowList = new ArrayList<Workflow>();
            for (Long id : ids){
                // 복사할 워크플로우 정보 로드
                Workflow workflow = workflowRepository.getById(id);
                Workflow copyWorkflow = this.copy(workflow);

                //  복사한 워크플로우 저장
                exportWorkflowList.add(copyWorkflow);
            }
            //---</워크플로우 목록 추출>----

            File workflowListObjFile = new File(workflowExportDir.toAbsolutePath().toString(), "workflowList.obj");
            ObjectOutputStream objectOutputStream = new ObjectOutputStream(new FileOutputStream(workflowListObjFile));
            objectOutputStream.writeObject(exportWorkflowList);
            objectOutputStream.close();
        }
        //---</워크플로우 목록을 직렬화 저장>---


        //---<파이썬 실행환경 정보릎 파일로 저장>---
        {
            //  실행환경 정보 얻기
            String runtimeEnvInfo = pythonUtil.getRuntimeEnvInfo();

            File pythonRuntimeEnvInfoFile =
                    new File(workflowExportDir.toAbsolutePath().toString(), "pythonRuntimeEnvInfo.txt");
            FileWriter fw = new FileWriter(pythonRuntimeEnvInfoFile);
            fw.write(runtimeEnvInfo);
            fw.close();
        }
        //---</파이썬 실행환경 정보릎 파일로 저장>---

        //---<내보내기용 디렉토리를 zip 파일로 저장>---
        Path zipFilePath = Files.createTempFile("workflowExport_", ".zip");		//임시 ZIP 압축 파일명
        ZipUtil.pack(workflowExportDir.toFile(), zipFilePath.toFile());
        //---</내보내기용 디렉토리를 zip 파일로 저장>---

        // 내보내기용 디렉토리 지우기
        FileUtils.deleteDirectory(workflowExportDir.toFile());

        return zipFilePath.toFile().getAbsolutePath();
    }


    /**
     * 워크플로우 내보내기 파일을 기반으로 가져오기 실행
     *
     * @param workflowExportFile 워크플로우 내보내기 파일
     * @return 예러 메시지(에러가 없을경우, null 반환)
     */
    public String workflowImport(MultipartFile workflowExportFile){

        String errorMessage = null;
        try{
            //  내보내기용 임시파일 생성
            Path zipFilePath = Files.createTempFile("workflowExport_", ".zip");
            //  내보내기용 파일 저장
            workflowExportFile.transferTo(zipFilePath);


            //  export 파일의 압축을 풀기위한 임시 디렉토리 생성
            Path workflowExportDir = Files.createTempDirectory("workflow_export_");

            //  export 파일의 압축을 풀기
            ZipUtil.unpack(zipFilePath.toFile(), workflowExportDir.toFile());


            //---<모듈파일을 복사>---
            File moduleFileDir = new File(workflowExportDir.toAbsolutePath().toString(), "module_file");
            if (moduleFileDir.isDirectory()){
                File targetDir = new File(ankusUserWorkspace);
                for (File moduleFile : moduleFileDir.listFiles()){
                    if (moduleFile.isDirectory()){
                        FileUtils.copyDirectoryToDirectory(moduleFile, targetDir);
                    }else{
                        FileUtils.copyFileToDirectory(moduleFile, targetDir);
                    }
                }
            }
            //---</모듈파일을 복사>---


            //---<워크플로우 직렬화 파일을 로드>---
            {
                File workflowListObjFile = new File(workflowExportDir.toAbsolutePath().toString(), "workflowList.obj");
                ObjectInputStream objectInputStream = new ObjectInputStream(new FileInputStream(workflowListObjFile));
                List<Workflow> workflowList = (List<Workflow>) objectInputStream.readObject();

                //  가져오기된 워크플로우를 저장(식별을 위해 이름 수정)
                for (Workflow workflow : workflowList){
                    workflow.setName("[가져오기"+DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDateTime.now())+" ] "+workflow.getName());
                    workflowRepository.save(workflow);
                }
            }
            //---</워크플로우 직렬화 파일을 로드>---


            //---<파이썬 실행환경 정보 파일을 저장>---
            {

                File infoFile = new File(workflowExportDir.toAbsolutePath().toString(), "pythonRuntimeEnvInfo.txt");
                File targetDir = new File(ankusUserWorkspace);
                File targetFile =
                        new File(ankusUserWorkspace,
                                "importWorkflowRuntimeEnvInfo_"+DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss").format(LocalDateTime.now())+".txt");
                FileUtils.moveFile(infoFile, targetFile);
            }
            //---</파이썬 실행환경 정보 파일을 저장>---


            //  파일삭제를 위한 가비지 콜랙션 수행
            System.gc();

            //  임시 디렉토리 삭제
            FileUtils.forceDelete(workflowExportDir.toFile());

            //  내보내기용 파일 삭제
            FileUtils.forceDelete(zipFilePath.toFile());
        }catch (IOException | ClassNotFoundException e){
            errorMessage = "내보내기 파일을 읽는 도중 에러가 발생하였습니다.";
            log.info(errorMessage, e);
        }

        return errorMessage;
    }




    /**
     * 복사 워크플로우를 생성 (해당 워크플로우는 비영속적임. 즉, JPA가 관리하지 않음)
     * (단, 워크플로우 활성화는 비활성로 설정.)
     *
     * @param workflow 복사할 워크플로우
     *
     * @return 복사된 워크플로우
     */
    public Workflow copy(Workflow workflow){
        // 복사 워크플로우 생성
        Workflow copyWorkflow = new Workflow();
        copyWorkflow.setName(workflow.getName());
        copyWorkflow.setActFlag(Flag.N);
        copyWorkflow.setExecCondType(workflow.getExecCondType());
        List<DayOfWeek> copyDayList = new ArrayList<DayOfWeek>();
        for (DayOfWeek dow : workflow.getExecCondDayList()){
            copyDayList.add(dow);
        }
        copyWorkflow.setExecCondDayList(copyDayList);
        copyWorkflow.setExecCondHour(workflow.getExecCondHour());
        copyWorkflow.setExecCondMin(workflow.getExecCondMin());
        copyWorkflow.setExecCondCronExp(workflow.getExecCondCronExp());
        copyWorkflow.setExecCondEventName(workflow.getExecCondEventName());
        copyWorkflow.setCreateUser(workflow.getCreateUser());
        // 복사 워크플로우 단계 생성
        List<WorkflowStep> copyWorkflowStepList = new ArrayList<WorkflowStep>();
        for (WorkflowStep workflowStep : workflow.getWorkflowStepList()) {
            WorkflowStep copyWorkflowStep = new WorkflowStep();
            copyWorkflowStep.setNum(workflowStep.getNum());
            // 복사 모듈 실행설정 생성
            List<ModuleExecConf> moduleExecConfList = new ArrayList<ModuleExecConf>();
            for (ModuleExecConf moduleExecConf : workflowStep.getModuleExecConfList()){
                ModuleExecConf copyModuleExecConf = new ModuleExecConf();
                copyModuleExecConf.setNum(moduleExecConf.getNum());
                copyModuleExecConf.setName(moduleExecConf.getName());
                copyModuleExecConf.setModuleFilePath(moduleExecConf.getModuleFilePath());
                List<String> cmdArgList = new ArrayList<String>();
                for (String cmdArg : moduleExecConf.getCmdArgList()){
                    cmdArgList.add(cmdArg);
                }
                copyModuleExecConf.setCmdArgList(cmdArgList);
                moduleExecConfList.add(copyModuleExecConf);
            }
            copyWorkflowStep.setModuleExecConfList(moduleExecConfList);
            copyWorkflowStepList.add(copyWorkflowStep);
        }
        copyWorkflow.setWorkflowStepList(copyWorkflowStepList);

        return copyWorkflow;
    }



    /**
     * 워크플로우 삭제
     * @param{List<Long>} id
     */
    public void workflowDelete(List<Long> ids){
        for(int i=0;i<ids.size();i++){
            workflowRepository.deleteById(ids.get(i));
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
