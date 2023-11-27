// 워크플로우 시각화

let module_load_ch = 1
let stepCount = 0; //step 카운트
let stepDelCount = 0; //step 삭제 카운트
let stepClick = 0           // step 클릭 위치
let module_count = 0        // 실행파일 설정 개수
let module_id_ing = 0       //현재 클릭된 모듈 id
let module_id_pre = 0       //이전 클릭된 모듈 id
let DayOfWeek = {"월":"MONDAY", "화":"TUESDAY", "수":"WEDNESDAY", "목":"THURSDAY", "금":"FRIDAY", "토":"SATURDAY", "일":"SUNDAY"}      // 한글을 영문으로 변경하기 위한 변수
let conf = false        // 이전 모듈이 수정 되었는지 여부
let page_close = true   // 현제 페이지를 나가는지 여부
let pre_data = null     // 처음 workflow 불러왔을때 데이터
let mouseClick = 'file'         // 마우스 클릭한 위치
let table_id    // 데이터 테이블

$(function(){
    // 2023-11-27 주석처리 by 김정호
    // (사유: 편집 변화에 상관없이 경고 메시지가 발생)
    //
    // window.addEventListener('beforeunload', (event) => {
    //     // 명세에 따라 preventDefault는 호출해야하며, 기본 동작을 방지합니다.
    //     event.preventDefault();
    //
    //     // 대표적으로 Chrome에서는 returnValue 설정이 필요합니다.
    //     if(page_close && !workflow_check()) {
    //         event.returnValue = '';
    //     }
    // });

    // cron 입력 이벤트
    document.querySelector(".cron_inp input").addEventListener("input",function (){
        this.value = this.value.replace(/[^0-9a-zA-Z,\-*?/ ]/g, '');
    })

    // 경고창 확인 버튼
    document.querySelector(".module_warning_bg button").addEventListener("click",function(){
        document.querySelector(".module_warning_bg").style.display = 'none'
    })
    // 경고창 x 버튼
    document.querySelector(".module_warning_bg img").addEventListener("click",function(){
        document.querySelector(".module_warning_bg").style.display = 'none'
    })

    // 모듈 파일 경로입력에 따른 파일 존재 여부 확인 이벤트
    document.querySelector(".module_load input").addEventListener("input",function (e){
        let arr = this.value.split("/")
        let parentDirPath = arr[0]
        for(let i=0;i<arr.length-1;i++){
            parentDirPath += "/"+arr[i]
        }
        $.ajax({
            type:"post",
            url:"file/existsFile",
            async:"false",
            data:{
                parentDirPath:parentDirPath,
                fileName:arr[arr.length-1]
            },
            success : function(data){
                document.querySelector(".module_load input").title = data
            },
            error:function (error){
                document.getElementsByClassName("warning_txt")[0].textContent = '파일존재 여부 확인중 에러가 났습니다'
                document.getElementsByClassName("warning_modal_bg")[0].style.display = 'inline'
            }
        })
    })

    // 스탭 추가
    $(".module_btn li").eq(2).click(function(){

        let el3 = document.getElementsByClassName("step_cont");
        for(let i=0;i<el3.length;i++){
            el3[i].classList.remove("step_cont_click");
        }

        let el2 = document.getElementsByClassName("step_title")
        for(let i=0;i<el2.length;i++){
            el2[i].classList.remove("step_title_click");
        }

        stepCount +=1
        let step = '<div class="step">' +
            '<ul class="sortable" id="sortable'+(stepCount)+'">' +
            '<li class="step_title ui-state-disabled step_title_click" onmouseup="">step'+(stepCount-stepDelCount)+
            '<img src="../common/images/workflow/fill_ex.svg" alt="엑스"></li>'+
            '</ul>'+
            '</div>'

        if(stepCount-stepDelCount === 1) {
            $(".workflow_view").append(step)
        }else{
           $($("#sortable"+stepClick)[0].parentElement).after(step)
        }

        // 모듈 없을 때 스탭 클릭 하기 위한 이벤트 처리
        document.querySelector("#sortable"+stepCount).addEventListener("mouseup",function(e){
            if(e.target.className.includes("step_title")) {
                let el = document.querySelectorAll(".step_title")
                for (let i = 0; i < el.length; i++) {
                    el[i].classList.remove("step_title_click")
                }
                this.getElementsByTagName("li")[0].classList.add("step_title_click")
                stepClick = parseInt(this.id.replace("sortable", ""))

                el = document.querySelectorAll(".step_cont")
                for (let i = 0; i < el.length; i++) {
                    el[i].classList.remove("step_cont_click")
                }
                if (this.children.length > 1) {       // 모듈이 있을 떄
                    previous_module_save_check(this.children[1])        // 첫번째 모듈 선택
                }
            }
        })

        $( "#sortable"+(stepCount) ).sortable({
            connectWith:".sortable",
            placeholder: "ui-state-highlight",
            items: "li:not(.ui-state-disabled)",
            stop:function(e,ui){
                let el = document.getElementsByClassName("step_cont")
                for(let i=0;i<el.length;i++){
                    el[i].classList.remove("step_cont_click");
                }


                let el2 = document.getElementsByClassName("step_title")
                for(let i=0;i<el2.length;i++){
                    el2[i].classList.remove("step_title_click");
                    el2[i].innerHTML = 'step'+(i+1)+'<img src="../common/images/workflow/fill_ex.svg" alt="엑스">'
                }

                ui.item[0].parentNode.firstChild.classList.add("step_title_click");
                ui.item[0].classList.add("step_cont_click");
                stepClick = parseInt(ui.item[0].parentNode.id.replace("sortable",""))
                
                
                contSort();     // 상세이력조회 정렬
                play_line();
            }
        });
        $( "#sortable"+(stepCount) ).disableSelection();
        stepClick = stepCount               // 현재 클릭한 스탭 id 저장

        let el = document.querySelectorAll(".step_title")
        for(let i=0;i<el.length;i++){
            el[i].innerHTML = 'step'+(i+1)+'<img src="../common/images/workflow/fill_ex.svg" alt="엑스">'
        }

    });

    // 모듈 설정 값 변경
    $(".module_btn li").eq(1).click(function(){
        module_id_pre = module_id_ing
        module_conf_change()
    })

    // 모듈 추가
    $(".module_btn li").eq(0).click(function(){
        if(module_add_check() === false){ return false}

        let el = document.querySelectorAll(".step_cont")
        for(let i=0;i<el.length;i++){
            el[i].classList.remove("step_cont_click")
        }

        let step_cont_click = false
        el = document.querySelectorAll("#sortable"+stepClick)
        for(let i=0;i<el.length;i++){
            if(el[i].children.length > 1){ step_cont_click = true}
        }

        let step = '<li id="module_'+module_count+'" class="step_cont step_cont_click" onmouseup="previous_module_save_check(this)" >'+document.querySelector(".module_name input").value+'<button></button></li>'

        if(step_cont_click){
            $("#module_"+module_id_ing).after(step)
        }else{
            $("#sortable"+(stepClick)).append(step)
        }


        document.getElementsByClassName("play_search_cont_wrap")[0].innerHTML +=  play_search_cont_all_html(module_count)

        module_id_ing = module_count        //현재 클릭된 모듈 id
        module_count += 1
        play_line()
        contSort();


    });

    // 택1 선택 여부 모달창 확인 버튼 이벤트
    document.querySelectorAll('.modify_warning_bg li button')[1].addEventListener('click',function (e) {
        document.querySelector('.modify_warning_bg').style.display = 'none'

        if(document.querySelector(".modify_warning_bg").title === "최종 저장"){
            save()
        }

        if(document.querySelector(".modify_warning_bg").title === "스텝 삭제"){
            let el = document.querySelectorAll(".step_title")
            let num = 1
            for(let i=0;i<el.length;i++){
                if(el[i].classList.contains("step_title_click")){
                    stepDelCount += 1
                    let sub_el = el[i].nextElementSibling
                    while(sub_el !== null){
                        let id = parseInt(sub_el.id.replace("module_",""))
                        document.getElementById("play_"+id).remove()
                        sub_el = sub_el.nextElementSibling
                    }
                    el[i].parentElement.parentElement.remove()
                }else{
                    el[i].innerHTML = "step"+num+'<img src="../common/images/workflow/fill_ex.svg" alt="엑스"></li>'
                    num += 1;
                }
            }
            if(document.querySelectorAll(".step_title").length>0){
                if(document.querySelectorAll(".step_title")[0].nextElementSibling !== null) {       // 모듈이 있을 때
                    previous_module_save_check(document.querySelectorAll(".step_title")[0].nextElementSibling)
                }else{

                    let el = document.querySelectorAll(".step_title")
                    for (let i = 0; i < el.length; i++) {
                        if(i===0) {
                            el[i].classList.add("step_title_click")
                            stepClick = parseInt(el[i].parentElement.id.replace("sortable", ""))
                        }else {
                            el[i].classList.remove("step_title_click")
                        }
                    }
                }
            }
        }

        // 모듈 수정 적용
        if(document.querySelector(".modify_warning_bg").title === "모듈 수정") {
            module_conf_change()
            module_play_change()
            module_click(document.getElementById("module_"+module_id_ing))
        }
    })
    // 택1 선택 여부 모달창 취소 버튼 이벤트
    document.querySelectorAll('.modify_warning_bg li button')[0].addEventListener('click',function () {
        document.querySelector('.modify_warning_bg').style.display = 'none'

        // 모듈 수정 적용
        if(document.querySelector(".modify_warning_bg").title === "모듈 수정") {
            module_play_change()
        }
    })
    // 택1 선택 여부 모달창 x번튼 이벤트
    document.querySelectorAll('.modify_warning_bg img')[0].addEventListener('click',function () {
        document.querySelector('.modify_warning_bg').style.display = 'none'
        
        // 모듈 수정 적용
        if(document.querySelector(".modify_warning_bg").title === "모듈 수정") {
            module_play_change()
        }
    })


    // 완료 모달창 이벤트
    document.querySelector(".complete_modal_bg button").addEventListener("click",function () {
        document.querySelector(".complete_modal_bg").style.display = 'none'
    })
    document.querySelector(".complete_modal_bg img").addEventListener("click",function () {
        document.querySelector(".complete_modal_bg").style.display = 'none'
    })
});

// 모듈 클릭
function module_click(e){

    let el = document.getElementsByClassName("step_cont")
    for(let i=0;i<el.length;i++){
        el[i].classList.remove("step_cont_click");
    }
    let el2 = document.getElementsByClassName("step_title")
    for(let i=0;i<el2.length;i++){
        el2[i].classList.remove("step_title_click");
    }
    e.parentNode.firstChild.classList.add("step_title_click");
    e.classList.add("step_cont_click");



    stepClick = parseInt(e.parentNode.id.replace("sortable",""))
}

// 이전 모듈 설정 저장 확인
function previous_module_save_check(e){
    if(parseInt(e.id.replace("module_","")) !== module_id_ing){
        module_id_pre = module_id_ing
        module_id_ing = parseInt(e.id.replace("module_",""))

        if(document.getElementById("module_"+module_id_pre)===null) {conf = false}
        conf = module_click_conf_check()    // 이전 모듈 설정을 수정 했는지 확인
        if(conf) {
            document.querySelector('.modify_warning_bg').title = "모듈 수정"
            document.querySelector('.modify_warning_bg').style.display='inline';
        }else {
            module_play_change();
            module_click(e)
        }

    }else{
        module_id_ing = parseInt(e.id.replace("module_",""))
        module_click(e)
        module_play_change()
    }
}

// 모듈 파일 실행 설정 값 변경
function module_play_change(){
    document.querySelector(".module_name input").value = document.querySelectorAll("#play_"+module_id_ing+" .play_cont li")[1].textContent
    document.querySelector(".module_load input").value = document.querySelectorAll("#play_"+module_id_ing+" .play_cont li")[3].textContent
    let el = document.querySelectorAll("#play_"+module_id_ing+" .play_cont_append .append_cont li")
    let t = ""
    for(let i=0;i<el.length;i++){
        t += "<span>" + el[i].textContent + "</span>"
    }
    document.getElementsByClassName("number_box")[0].innerHTML = t
    play_line()
}

function play_line(){
    if(document.getElementsByClassName("play_search_cont_all_bg").length>0) {
        document.getElementsByClassName("play_search_cont_all_bg")[0].remove()
    }
    document.querySelector("#play_"+module_id_ing).innerHTML += '<div class="play_search_cont_all_bg"></div>'

    let play_scrollY = document.getElementById("play_"+module_id_ing).offsetTop-document.getElementById("play_"+module_id_ing).offsetHeight/2
    document.getElementsByClassName("play_search_cont_wrap")[0].scrollTo(0,play_scrollY)
}

// 모듈 값 변경 적용
function module_conf_change(){
    if(module_change_check() === false) {return false}

    if(document.getElementById("module_"+module_id_pre)===null) {return false;}
    document.getElementById("module_"+module_id_pre).firstChild.textContent = document.querySelector('.module_name input').value
    let module_name = document.querySelector('.module_name input').value
    let module_load = document.querySelector('.module_load input').value
    let number_box = document.querySelector('.number_box').children
    let t = ''
    for(let i = 0; i < number_box.length; i++){
        t += '<li>'+number_box[i].textContent+'</li>'
    }
    let cont = document.getElementById('play_'+module_id_pre)
    cont.children[0].children[1].textContent = module_name
    cont.children[1].children[1].textContent = module_load
    cont.children[2].children[1].innerHTML = t

    document.querySelector(".complete_modal_bg .complete_txt").textContent = "설정 수정이 완료되었습니다"
    document.querySelector(".complete_modal_bg").style.display = 'inline'
}


window.onload=function(){

    document.querySelector(".module_load_modal .module_modal_right .module_right_btn").addEventListener("click",function(){
        let el = document.querySelectorAll("#table_id tbody tr")
        for(let i=0;i<el.length;i++){
            if(el[i].classList.contains("backgroundColor_dfecfd")){
                fileNamedbclick(el[i].querySelector("td span").title)
            }
        }
    })
    document.querySelector(".module_load_modal .module_modal_right .module_right_c_btn").addEventListener("click",function(){
        document.querySelector(".module_load_modal_bg").style.display = 'none'
    })

    document.getElementsByClassName("/")[0].addEventListener("click",function (e) {
        if(e.target.nodeName==="INPUT"){
            document.querySelector("#table_id tbody").title=e.target.id
            showChildFileList(e.target.id)
            let el = document.getElementsByClassName('/')[0].getElementsByTagName('span')
            for(let i=0;i<el.length;i++){
                el[i].classList.remove('backgroundColor_c0dbff')
            }
            document.getElementsByClassName(e.target.id)[0].children[1].classList.add('backgroundColor_c0dbff')

        }
        if(e.target.nodeName==="SPAN"){
            document.querySelector("#table_id tbody").title=e.target.previousElementSibling.id
            showChildFileList(e.target.previousElementSibling.id)
            let el = document.getElementsByClassName('/')[0].getElementsByTagName('span')
            for(let i=0;i<el.length;i++){
                el[i].classList.remove('backgroundColor_c0dbff')
            }
            document.getElementsByClassName(e.target.previousElementSibling.id)[0].children[1].classList.add('backgroundColor_c0dbff')
        }

        if(e.target.nodeName==="IMG"){
            document.querySelector("#table_id tbody").title=e.target.parentNode.previousElementSibling.id
            showChildFileList(e.target.parentNode.previousElementSibling.id)
            let el = document.getElementsByClassName('/')[0].getElementsByTagName('span')
            for(let i=0;i<el.length;i++){
                el[i].classList.remove('backgroundColor_c0dbff')
            }
            document.getElementsByClassName(e.target.parentNode.previousElementSibling.id)[0].children[1].classList.add('backgroundColor_c0dbff')
        }
    })

    document.getElementById("table_id").addEventListener("click",function (e) {
        if(e.target.nodeName==="SPAN" && e.target.textContent==='열기'){

            e.target.lastChild.style.display='inline'
            $.ajax({
                type : "get",
                url : "/file/getJupyterlabUrl",
                data: {"filePath": e.target.title},
//                async:false,
                success : function(data){
                    //  JupyterLab URL로 새로운 창 열기
                    let pop = window.open(data, "_blank");
                    e.target.lastChild.style.display='none'

                },
                error:function (error){
                    document.querySelector('.module_warning_bg .module_warning_txt').textContent = "파일 열기를 실패하였습니다."
                    document.querySelector('.module_warning_bg').style.display = 'inline'
                }
            });
        }
    })


    // 워크플로우 UI 클릭
    document.getElementsByClassName("workflow_view")[0].addEventListener("click",function(e){
        // x버튼 클릭 시 모듈 삭제
        if(e.target.nodeName==='BUTTON'){
            e.target.parentNode.remove()

            let el = document.getElementsByClassName('play_search_cont_all');
            for(let i=0;i<el.length;i++){
                if(el[i].childNodes[0].childNodes[1].textContent===e.target.parentNode.firstChild.textContent){
                    el[i].remove()
                }
            }

            // 삭제 후 남은 모듈이 있으면 처음 모듈 클릭
            if(document.querySelectorAll(".step_cont").length > 0){
                previous_module_save_check(document.querySelectorAll(".step_cont")[0])
            }
        }

        if(e.target.nodeName==='IMG') {
            if (e.target.parentElement.parentElement.children.length > 1) {
                if(!e.target.parentElement.className.includes("step_title_click")) {
                    let el = document.querySelectorAll(".step_title")
                    for (let i = 0; i < el.length; i++) {
                        el[i].classList.remove("step_title_click")
                    }
                    e.target.parentElement.classList.add("step_title_click")
                    if(e.target.parentElement.nextElementSibling !== null) {
                        previous_module_save_check(e.target.parentElement.nextElementSibling)
                    }
                }

                document.querySelector(".modify_warning_bg").title = "스텝 삭제"
                document.querySelector(".modify_warning_bg .modify_warning_txt").textContent = "스텝 삭제 시 실행설정도 같이 삭제됩니다"
                document.querySelector(".modify_warning_bg").style.display = 'inline'
            }else{
                stepDelCount += 1
                e.target.parentElement.parentElement.parentElement.remove()
                let el = document.querySelectorAll(".step_title")
                for(let i=0;i<el.length;i++){
                    el[i].innerHTML = "step"+(i+1)+'<img src="../common/images/workflow/fill_ex.svg" alt="엑스"></li>'
                }

                if(document.querySelectorAll(".step_title").length>0){
                    if(document.querySelectorAll(".step_title")[0].nextElementSibling !== null) {       // 모듈이 있을 때
                        previous_module_save_check(document.querySelectorAll(".step_title")[0].nextElementSibling)
                    }else{

                        let el = document.querySelectorAll(".step_title")
                        for (let i = 0; i < el.length; i++) {
                            if(i===0) {
                                el[i].classList.add("step_title_click")
                                stepClick = parseInt(el[i].parentElement.id.replace("sortable", ""))
                            }else {
                                el[i].classList.remove("step_title_click")
                            }
                        }
                    }
                }
            }
        }
    })

    // 추가된 인수 클릭 이벤트
    document.querySelector(".number_box").addEventListener("click",function(e){
        if(e.target.nodeName==='SPAN'){
            document.querySelectorAll(".number_box span").forEach(el=>{
                el.classList.remove('backgroundColor_25320248')
            })
            e.target.classList.add('backgroundColor_25320248')
        }
    })

    // 워크플로우 취소
    document.getElementsByClassName('cancel')[0].addEventListener('click',function(){


        page_close = false
        location.href = 'workflow_list'
    })

    // 워크플로우 최종 저장
    document.getElementsByClassName('save')[0].addEventListener("click",function (){
        if(workflow_save_check()){
            return false
        }



        // 빈 스탭이 있는지 확인
        let el = document.querySelectorAll(".step ul")
        let ch = 0
        for(let i=0;i<el.length;i++){
            if(el[i].children.length === 1){
                ch += 1
            }
        }

        // 실행 파일 설정이 변경 되었는지 확인
        el = document.querySelectorAll(".play_search_cont_all")
        for(let i=0;i<el.length;i++){
            if(el[i].innerHTML.includes("play_search_cont_all_bg")){
                if(el[i].querySelectorAll("ul")[0].querySelectorAll("li")[1].textContent !== document.querySelector(".module_name input").value){
                    ch += 2
                    break
                }else if(el[i].querySelectorAll("ul")[1].querySelectorAll("li")[1].textContent !== document.querySelector(".module_load input").value){
                    ch += 2
                    break
                }else{
                    let el_sub = el[i].querySelectorAll(".play_cont_append .append_cont li")
                    if(el_sub.length !== document.querySelectorAll(".number_box span").length){
                        ch += 2
                        break
                    }
                    let chk = 0
                    for(let s=0;s<el_sub.length;s++){
                        if(el_sub[s].textContent !== document.querySelectorAll(".number_box span")[s].textContent){
                            ch += 2
                            chk =1
                            break
                        }
                    }
                    if(chk===1){break}
                }
            }
        }

        for(let i=0;i<el.length;i++){
            if(el[i].innerHTML.includes("play_search_cont_all_bg")){
                el[i].querySelectorAll("ul")[0].querySelectorAll("li")[1].textContent = document.querySelector(".module_name input").value
                el[i].querySelectorAll("ul")[1].querySelectorAll("li")[1].textContent = document.querySelector(".module_load input").value
                el[i].querySelector(".play_cont_append .append_cont").innerHTML=''
                let el_sub = document.querySelectorAll(".number_box span");
                let t = ""
                for(let s=0;s<el_sub.length;s++){
                    t += '<li>'+el_sub[s].textContent+'</li>'
                }
                el[i].querySelector(".play_cont_append .append_cont").innerHTML = t
            }
        }

        page_close = false

        if(ch === 1) {
            document.querySelector(".modify_warning_bg").title = "최종 저장"
            document.querySelector(".modify_warning_bg .modify_warning_txt").textContent = "실행설정이 없는 스탭은 자동 삭제 후 저장됩니다"
            document.querySelector(".modify_warning_bg").style.display = 'inline'
        }else if(ch === 2){
            document.querySelector(".modify_warning_bg").title = "최종 저장"
            document.querySelector(".modify_warning_bg .modify_warning_txt").textContent = "현재 선택된 실행설정값 수정 후 저장됩니다"
            document.querySelector(".modify_warning_bg").style.display = 'inline'
        }else if(ch === 3){
            document.querySelector(".modify_warning_bg").title = "최종 저장"
            document.querySelector(".modify_warning_bg .modify_warning_txt").textContent = "실행설정이 없는 스탭은 자동 삭제 및 현재 선택된 실행설정값 수정 후 저장됩니다"
            document.querySelector(".modify_warning_bg").style.display = 'inline'
        } else{

            save()
        }
    })
}

$(function () {
    $('.module_load li').eq(1).click(function () {
        if(document.querySelector(".module_load input").value.replace(/ /g, '') !== "") {
            $.ajax({
                type: "get",
                url: "/file/getJupyterlabUrl",
                data: {"filePath": document.querySelector(".module_load input").value},
                //                async:false,
                success: function (data) {
                    //  JupyterLab URL로 새로운 창 열기
                    let pop = window.open(data, "_blank");
                },
                error: function (error) {
                    document.querySelector('.warning_modal_bg .warning_txt').textContent = "파일 열기를 실패하였습니다."
                    document.querySelector('.warning_modal_bg').style.display = 'inline'
                }
            });
        }else{
            document.querySelector(".module_warning_bg .module_warning_txt").textContent = '경로 입력해주세요'
            document.querySelector(".module_warning_bg").style.display = 'inline'
        }
    });
    $('.module_load li').eq(2).click(function () {
        $('.module_load_modal_bg,.module_load_modal').stop().fadeIn();
        if(module_load_ch==1){
            fileLoad("/");      // module 경로 확인 modal 창에 폴더 목록 불러오기
            module_load_ch=0
        }
    });
    $('.module_file_btn img').click(function () {
        $('.module_load_modal_bg,.module_load_modal').stop().fadeOut();
    });

});
$(function () {
    // 인수 추가 모달창 팝업
    $('.number_btn_list li').eq(0).click(function () {
        $(".factor_modal input").val('')
        $(".factor_modal input").attr('title','추가')
        $('.factor_modal_bg').stop().fadeIn();
    });
    // 인수 수정 모달창 팝업
    $('.number_btn_list li').eq(1).click(function () {

        let ch = 0
        const el = document.getElementsByClassName("number_box")[0].childNodes
        for(let i=0;i<el.length;i++){
            if(el[i].className.includes("backgroundColor_25320248")){
                $(".factor_modal input").val(el[i].textContent)
                ch = 1
                break;
            }
        }
        if(ch === 1) {
            $(".factor_modal input").attr('title', '변경')
            $('.factor_modal_bg').stop().fadeIn();
        }
        if(el.length===0){
            document.querySelector(".module_warning_bg .module_warning_txt").textContent = "수정할 인수를 선택해주세요"
            document.querySelector(".module_warning_bg").style.display = 'inline'
        }
    });
    // 인수 삭제
    $('.number_btn_list li').eq(2).click(function () {

        let el = document.querySelectorAll('.number_box span')
        for(let i=0;i<el.length;i++){
            if(el[i].className.includes("backgroundColor_25320248")){
                el[i].remove();
                if(document.querySelectorAll('.number_box span').length > 0){
                    document.querySelectorAll('.number_box span')[0].classList.add("backgroundColor_25320248")
                }
                break;
            }
        }
        if(el.length===0){
            document.querySelector(".module_warning_bg .module_warning_txt").textContent = "삭제할 인수를 선택해주세요"
            document.querySelector(".module_warning_bg").style.display = 'inline'
        }
    })

    document.querySelector(".factor_modal input").addEventListener('input',function () {
        if(this.value.replace(/ /g,'') === ''){
        }else{
            if(this.title==="수정") {
                let el = document.querySelectorAll(".number_box span")
                for (let i = 0; i < el.length; i++) {
                    if (el[i].className.includes("backgroundColor_25320248") && el[i].textContent === this.value) {
                    }
                }
            }
        }
    })
    
    
    // 인수 추가 또는 수정 모달창 취소 버튼
    $('.factor_btn_list li button').eq(0).click(function () {
        $(".factor_modal input").val('')
        $('.factor_modal_bg').stop().fadeOut();
    });
    // 인수 추가 또는 수정 모달창 확인 버튼
    $('.factor_btn_list li button').eq(1).click(function () {
        if($(".factor_modal input").attr('title')==='추가'){
            if($(".factor_modal input").val().replace(/ /g,"") !== "") {
                const el = document.getElementsByClassName("number_box")[0].childNodes
                for(let i=0;i<el.length;i++){
                    el[i].classList.remove("backgroundColor_25320248")
                }

                $(".number_box").append('<span class="backgroundColor_25320248">' + $(".factor_modal input").val() + '</span>')
                $('.factor_modal_bg').stop().fadeOut();
            }else{
                document.querySelector(".module_warning_bg .module_warning_txt").textContent = "인수 값을 입력해주세요"
                document.querySelector(".module_warning_bg").style.display = 'inline'
            }
        }else{  // 인수 변경
            if($(".factor_modal input").val().replace(/ /g,"") !== "") {
                const el = document.getElementsByClassName("number_box")[0].childNodes
                for (let i = 0; i < el.length; i++) {
                    if (el[i].className.includes("backgroundColor_25320248")) {
                        el[i].textContent = $(".factor_modal input").val()
                        break;
                    }
                }
                $('.factor_modal_bg').stop().fadeOut();
            }else{
                document.querySelector(".module_warning_bg .module_warning_txt").textContent = "인수 값을 입력해주세요"
                document.querySelector(".module_warning_bg").style.display = 'inline'
            }
        }
    });
    // 인수 추가 또는 수정 모달창 x버튼
    $('.factor_modal img').click(function () {
        $('.factor_modal_bg').stop().fadeOut();
    });
});


$(function() {
    const selectBoxElements = document.querySelectorAll(".select");

    function toggleSelectBox(selectBox) {
        selectBox.classList.toggle("active");
    }

    function selectOption(optionElement) {
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value");
        selectedElement.textContent = optionElement.textContent;
        selectedElement.style.color = 'black'
    }


    selectBoxElements.forEach(selectBoxElement => {
        selectBoxElement.addEventListener("click", function (e) {
            const targetElement = e.target;
            const isOptionElement = targetElement.classList.contains("option");


            if (isOptionElement) {
                selectOption(targetElement);

            }

            toggleSelectBox(selectBoxElement);
        });
    });

    document.addEventListener("click", function (e) {
        const targetElement = e.target;
        const isSelect = targetElement.classList.contains("select") || targetElement.closest(".select");

        if (isSelect) {
            return;
        }

        const allSelectBoxElements = document.querySelectorAll(".select");

        allSelectBoxElements.forEach(boxElement => {
            boxElement.classList.remove("active");
        });
    })
})


function fileNamedbclick(path) {
    document.querySelector(".module_load input").title = true
    document.querySelector('.module_load input').value=path
    document.querySelector(".module_load_modal_bg").style.display='none'
}

$(function(){
    $(".select ul li").eq(0).click(function(){
        $(".cron_inp input").hide();
        $(".status_inp input").hide();
        $(".condition_list, .time_all input").show();
    });
    $(".select ul li").eq(1).click(function(){
        $(".cron_inp input").show();
        $(".condition_list, .time_all input").hide();
        $(".status_inp input").hide();
    });
    $(".select ul li").eq(2).click(function(){
        $(".cron_inp input").hide();
        $(".status_inp input").show();
        $(".condition_list, .time_all input").hide();
    });
});

//실행이력조회 
$(function () {
    $("input+.ham_menu").click(function () {
        $(".play_search_all").toggle().animate({ right: "-2%" }, 500);
    });
});


function play_search_cont_all_html(id){

    const moduleName = document.querySelector(".module_name input").value
    const modulePath = document.querySelector(".module_load input").value
    const moduleParameter = document.querySelectorAll('.number_box span')

    let t = ''
    for(let i=0;i<moduleParameter.length;i++){
        t += '<li>'+moduleParameter[i].innerText+'</li>'
    }

    return '<div class="play_search_cont_all" id="play_'+id+'">'+
                               '<ul class="play_cont">'+
                                   '<li>이름</li>'+
                                   '<li>'+moduleName+'</li>'+
                               '</ul>'+
                               '<ul class="play_cont">'+
                                   '<li>경로</li>'+
                                   '<li>'+modulePath+'</li>'+
                               '</ul>'+
                               '<div class="play_cont_append">'+
                                   '<ul class="append_title">'+
                                       '<li>명령어<br>인수<br>목록</li>'+
                                   '</ul>'+
                                   '<ul class="append_cont">'+
                                       t+
                                   '</ul>'+
                               '</div>'+
                           '</div>'
}


function moduleNameCheck(){         // 추가 모듈 이름 중복 체크 함수
    let el = document.getElementsByClassName('play_search_cont_all')
    let moduleName = document.querySelector('.module_name input').value
    for(let i=0;i<el.length;i++){
        if(el[i].children[0].children[1].textContent===moduleName){
            return false
        }
    }
    return true
}


// 폴더 경로 가져오기
function fileLoad(parentDirPath) {
    if(parentDirPath==="/"){ showChildFileList(parentDirPath);}
    $.ajax({
        url:"file/listChildDir",
        type:"post",
        data:{parentDirPath:parentDirPath},
        success:function (data) {

            data = JSON.parse(data)
            if(data.length>0) {
                let t = ""
                let parentPaddingLeft = parseInt(document.getElementsByClassName(parentDirPath)[0].getElementsByTagName('label')[0].style.paddingLeft.replace("px",""))+16
                for (let i = 0; i < data.length; i++) {
                    t += '<ul>'+
                            '<li class="' + (parentDirPath==="/"?parentDirPath:parentDirPath+"/") + data[i]['title'] + '">'+
                                '<input type="checkbox" id="' + (parentDirPath==="/"?parentDirPath:parentDirPath+"/") + data[i]['title'] + '" checked>'+
                                '<span>'+
                                    '<label for="' + (parentDirPath==="/"?parentDirPath:parentDirPath+"/") + data[i]['title'] + '" style="padding-left: '+parentPaddingLeft+'px;"></label>'+
                                    '<img src="/common/images/file/file.svg" alt="파일">'+data[i]['title']+
                                '</span>'+
                            '</li>'+
                        '</ul>'
                }
                document.getElementsByClassName("" + parentDirPath)[0].innerHTML += t
                for (let i = 0; i < data.length; i++) {
                    fileLoad((parentDirPath==="/"?parentDirPath:parentDirPath+"/") + data[i]['title'])
                }
            }


        },
        error:function (err) {
            console.log(err)
        }
    })
}

/**
 * 자식 파일 목록을 보여주기
 *
 * @param parentDirPath 부모 디렉터리 경로(사용자 작업공간 기준 상대경로)
 */
function showChildFileList(parentDirPath){
    document.querySelector(".tree_all").title = parentDirPath

    $.ajax({
        url:"/file/listChildFile",
        type:"post",
        data: {"parentDirPath": parentDirPath},
        success:function (data){
            table_id=$('#table_id').DataTable({
                data:JSON.parse(data),
                responsive: true,
                order:[0,'asc'],
                paging: false,
                searching: false,
                info: false,
                orderable: true,
                destroy: true,
                scrollY: 354,
                columns: [
                    { data: 'name' },
                    { data: 'date' },
                    { data: 'path' },
                ],
                columnDefs: [
                    {
                        targets: [0, 1, 2],
                        className: "dt-center"

                    },
                    {
                        targets: [0],
                        width: "45%",
                        render: function (data, type, full, meta) {
                            return '<span title="'+full.path+'">' + data + '</span>';
                        }
                    },
                    {
                        targets: [1],
                        width: "35%",
                    },
                    {
                        targets: [2],
                        width: "20%",
                        searchable: false,
                        orderable: false,
                        checkboxes: { selectRow: true },
                        render: function (data, type, full, meta) {
                            //  파일열기 버튼 활성화
                            let retColVal = ""
                            let s = data.split(".")
                            if(s[s.length-1] === 'ipynb' || s[s.length-1] === 'py'){retColVal = '<span title="'+data+'">열기<img class="gif" src="/common/images/file/loading.gif" alt="로딩"></span>'}

                            return retColVal;
                        }
                    },
                ]
            });
            table_id.on( 'click', 'tr', function (e) {
                let el = document.querySelectorAll("#table_id tbody tr")
                for(let i=0;i<el.length;i++){
                    el[i].classList.remove("backgroundColor_dfecfd")
                }
                this.classList.add("backgroundColor_dfecfd")
            });
            table_id.on( 'dblclick', 'tr', function () {
                fileNamedbclick(this.querySelector("td").querySelector("span").title)
            });
        },
        error:function (err) {
            console.log(err)
        }
    })
}


// workflow UI맞춰 실행이력조회 UI 정렬하는 함수
function contSort(){
    let step = document.getElementsByClassName('step_cont')
    let cont = document.getElementsByClassName('play_search_cont_all')
    let result = []
    
    // html 재정렬
    for(let s=0;s<step.length;s++){
        for(let c=0;c<cont.length;c++){
            if(step[s].firstChild.textContent===cont[c].childNodes[0].childNodes[1].textContent){
                result.push(cont[c].innerHTML)
                break;
            }
        }
    }
    
    for(let c=0;c<cont.length;c++){
        cont[c].innerHTML = result[c]       // html 입력
        cont[c].id = "play_"+step[c].id.replace("module_","")       // id 재정의
    }
}

$(function(){
    if(window.location.pathname.includes('change')){
        $.ajax({
            url: 'workflow_select',
            type: "POST",
            data: {id: workflowId},
            success: function (data) {
                pre_data = data
                document.getElementsByClassName('workflow_name')[0].value=data.name           // 워크플로우 이름 입력
                document.getElementsByName('active')[data.actFlag === "Y" ? 0 : 1].checked = "checked"      // 활성화 여부 입력
                // 실행 조건 입력
                if (data.execCondType === 'PERIOD_CRON') {
                    document.getElementsByClassName('option')[1].click()
                    document.getElementsByClassName('select')[0].className='select'
                    document.querySelector(".cron_inp input").value=data.execCondCronExp

                } else if(data.execCondType === 'PERIOD_DAY_TIME') {
                    document.getElementsByClassName('option')[0].click()
                    document.getElementsByClassName('select')[0].className='select'
                    // document.getElementsByClassName('selected-value')[0].value='요일:시각'
                    document.querySelectorAll('.condition_list input').forEach(e=>{
                        let day = data.execCondDayList;
                        for(let i=0;i<day.length;i++){
                            if(day[i]===DayOfWeek[e.nextElementSibling.textContent.split("\n")[0]]){e.checked=true}
                        }
                    })
                    const hour = data.execCondHour<10 ? "0"+data.execCondHour : data.execCondHour
                    const min = data.execCondMin<10 ? "0"+data.execCondMin : data.execCondMin
                    document.querySelector('.time_all input').value=hour+":"+min
                }else{
                    document.getElementsByClassName('option')[2].click()
                    document.getElementsByClassName('select')[0].className='select'
                    document.querySelector(".status_inp input").value=data.execCondEventName
                }

                let workflowStepList = data.workflowStepList
                for(let i=0;i<workflowStepList.length;i++){
                    document.querySelectorAll('.module_btn li')[2].click()
                    for(let m=0;m<workflowStepList[i].moduleExecConfList.length;m++){
                        document.querySelector('.module_name input').value = workflowStepList[i].moduleExecConfList[m].name
                        document.querySelector('.module_load input').value = workflowStepList[i].moduleExecConfList[m].moduleFilePath
                        document.querySelector('.number_box').innerHTML=''      // 추가된 인수 UI 초기화
                        for(let c=0;c<workflowStepList[i].moduleExecConfList[m].cmdArgList.length;c++){
                            $(".number_box").append('<span>'+workflowStepList[i].moduleExecConfList[m].cmdArgList[c]+'</span>')
                        }
                        document.querySelectorAll('.module_btn li')[0].click()
                    }
                }

            },
            error: function (err) {
                console.log(err)
            }
        });
    }
})

function module_click_conf_check(){
    if(document.querySelectorAll("#play_"+module_id_pre+" ul li").length===0){
        return false
    }
    let play_name = document.querySelectorAll("#play_"+module_id_pre+" ul li")[1].textContent
    let play_url = document.querySelectorAll("#play_"+module_id_pre+" ul li")[3].textContent
    let play_cont = []
    let el = document.querySelectorAll("#play_"+module_id_pre+" .append_cont")[0].children
    for(let i=0;i<el.length;i++){
        play_cont.push(el[i].textContent)
    }

    let module_name = document.querySelector(".module_name input").value
    let module_load = document.querySelector(".module_load input").value
    let number_box = []
    let el2 = document.querySelector(".number_box").children
    for(let i=0;i<el2.length;i++){
        number_box.push(el2[i].textContent)
    }


    if(play_name !== module_name){
        return true
    }

    if(play_url !== module_load){
        return true
    }

    if(el.length !== el2.length){
        return true
    }

    for(let i=0;i<play_cont.length;i++){
        if(number_box.includes(play_cont[i])){
            break
        }
        if(i===play_cont.length-1){
            return true
        }
    }
    return false
}

// 모듈 이름 중복 확인
function module_name_check(stats){
    let name = document.querySelector(".module_name input").value
    if(name.replace(/ /g,"") === ""){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "실행설정 이름을 입력해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }
    
    let el = document.querySelectorAll(".step_cont")
    for(let i=0;i<el.length;i++){
        if(el[i].className.includes("step_cont_click") === false || stats==="add"){
            if(el[i].childNodes[0].textContent === name){
                document.querySelector(".module_warning_bg .module_warning_txt").textContent = "실행설정 이름이 중복되었습니다"
                document.querySelector(".module_warning_bg").style.display = 'inline'
                return false
            }
        }
    }
    return true
}

// 모듈 추가 확인
function module_add_check(){
    if(document.querySelectorAll(".step").length === 0){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "스텝을 추가해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }

    if(module_name_check("add") === false){
        return false
    }
    if(document.querySelector(".module_load input").value.replace(/ /g,"") === ""){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "실행파일을 선택해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }
    if(document.querySelector(".module_load input").title === 'false'){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "해당 실행파일이 존재하지 않습니다"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }
    return true
}

function module_change_check(){
    if(document.querySelectorAll(".step_cont").length === 0){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "수정할 설정을 선택해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }
    if(module_name_check("change") === false){
        return false
    }
    if(document.querySelector(".module_load input").value.replace(/ /g,"") === ""){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "실행파일을 선택해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }

    if(document.querySelector(".module_load input").title === 'false'){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "해당 실행파일이 존재하지 않습니다"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }
    return true
}

// 워크플로우 최종 저장 여부
function workflow_save_check(){
    // 워크플로우명 확인
    if(document.getElementsByClassName("workflow_name")[0].value.replace(/ /g,"") === ""){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "워크플로우명을 입력해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return true
    }
    let run_status = document.getElementsByClassName("selected-value")[0].textContent
    // 실행조건 확인
    if(run_status === "검색구분"){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "실행조건을 선택해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return true
    }

    // 실행조건에 따른 실행값 확인
    if(run_status === "요일 및 시각"){
        let el = document.querySelectorAll('.condition_list input')
        let dayChecked = false
        for(let i=0; i<el.length; i++){
            if(el[i].checked){
                dayChecked = el[i].checked
                break
            }

        }
        if(dayChecked === false){
            document.querySelector(".module_warning_bg .module_warning_txt").textContent = "날짜를 1개이상 체크해주세요"
            document.querySelector(".module_warning_bg").style.display = 'inline'
            return true
        }

        if(document.getElementsByName('inp_time')[0].value===""){
            document.querySelector(".module_warning_bg .module_warning_txt").textContent = "실행시간을 설정해주세요"
            document.querySelector(".module_warning_bg").style.display = 'inline'
            return true
        }
    }
    else if(run_status === "cron 형식"){
        if(document.querySelector('.cron_inp input').value.replace(/ /g,"") === ''){
            document.querySelector(".module_warning_bg .module_warning_txt").textContent = "cron 형식을 입력해주세요"
            document.querySelector(".module_warning_bg").style.display = 'inline'
            return true
        }
        if(cronCheck(document.querySelector('.cron_inp input').value) === false){
            document.querySelector(".module_warning_bg .module_warning_txt").textContent = "입력하신 cron형식에 맞지 않습니다"
            document.querySelector(".module_warning_bg").style.display = 'inline'
            return true
        }
    }
    else if(run_status === "이벤트 청취" && document.querySelector('.status_inp input').value.replace(/ /g,"") === ''){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "청취 이벤트명을 입력해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return true
    }

    if(document.getElementsByClassName("step_cont").length === 0){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "1개 이상의 실행파일을 등록해야 합니다"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return true
    }

    return false
}


function save(){
    let workflow = create_obj_data()

    $.ajax({
        type: 'POST',
        url: "workflow_add",
        data: JSON.stringify(workflow),
        dataType: "json",
        contentType: "application/json",
        success: function (data, textStatus, jqXHR) {
            //  화면 이동
            location.href = "workflow_list";
        }, error: function (error) {
            console.log(error)
        }
    });
}


function create_obj_data(){
    let exec_cond_day = []      // 날짜 저장 배열

    document.querySelectorAll('.condition_list input').forEach(e=>{
        if(e.checked){ exec_cond_day.push(DayOfWeek[e.nextElementSibling.textContent.split("\n")[0]])}
    })

    let workflowStepList=[]
    let workflowStep = {}

    let moduleExecConfList = []
    let moduleExecConf = {}

    let cmdArgList = []

    let step = document.getElementsByClassName('step')
    for(let i=0;i<step.length;i++){
        if(step[i].childNodes[0].childNodes.length>1){      // step 안에 module이 1개 이상 있는지 확인
            workflowStep['num'] = i+1

            let module = step[i].childNodes[0].childNodes;      // 모듈
            for(let m=1;m<module.length;m++){
                moduleExecConf['num'] = 1
                moduleExecConf['name'] = module[m].firstChild.textContent

                let cont = document.getElementsByClassName('play_search_cont_all');
                for(let c=0;c<cont.length;c++){
                    if(cont[c].childNodes[0].childNodes[1].textContent===moduleExecConf['name']){
                        moduleExecConf['moduleFilePath']=cont[c].childNodes[1].childNodes[1].textContent
                        for(let a=0;a<cont[c].childNodes[2].childNodes[1].childNodes.length;a++){
                            cmdArgList.push(cont[c].childNodes[2].childNodes[1].childNodes[a].textContent)
                        }
                        moduleExecConf['cmdArgList'] = cmdArgList;
                    }
                }
                moduleExecConfList.push(moduleExecConf);
                moduleExecConf={};
                cmdArgList=[];
            }
            workflowStep['moduleExecConfList'] = moduleExecConfList;
            workflowStepList.push(workflowStep);
            workflowStep = {};
            moduleExecConfList = [];
        }
    }
    let execCondType = "PERIOD_DAY_TIME"
    if(document.getElementsByClassName('selected-value')[0].textContent === 'cron 형식'){
        execCondType = 'PERIOD_CRON'
    }else if(document.getElementsByClassName('selected-value')[0].textContent === '이벤트 청취'){
        execCondType = 'EVENT_LISTEN'
    }

    let workflow = {
        name : document.getElementsByClassName("workflow_name")[0].value,
        actFlag : document.getElementsByName('active')[0].checked ? 'Y' : 'N',
        execCondType : execCondType,
        execCondHour : document.getElementsByName('inp_time')[0].value.split(":")[0],
        execCondMin : document.getElementsByName('inp_time')[0].value.split(":")[1],
        execCondCronExp : document.querySelector(".cron_inp input").value,
        execCondDayList:exec_cond_day,
        execCondEventName:document.querySelector(".status_inp input").value,
        workflowStepList:workflowStepList,
    }
    if(window.location.pathname.includes('change') && pre_data['createUser'].split("_")[0] === loginId) {
        workflow['id']=workflowId
    }

    console.log(workflow)
    return workflow
}

function workflow_check(){
    let workflow = create_obj_data()

    if(pre_data['actFlag'] !== workflow['actFlag']){            // 활성화
        console.log('actFlag')
        return false
    }

    if(pre_data['name'] !== workflow['name']){                  // 워크플로우명
        console.log('name')
        return false
    }

    // 실행조건
    if(pre_data['execCondType'] !== workflow['execCondType']){
        console.log('execCondType')
        return false
    }else{
        if(pre_data['execCondType'] === 'PERIOD_DAY_TIME'){
            if(pre_data['execCondDayList'].length !== workflow['execCondDayList'].length){
                console.log('execCondDayList length')
                return false
            }else{
                for(let i=0;i<pre_data['execCondDayList'].length;i++){  // 요일 확인
                    if(!workflow['execCondDayList'][i].includes(pre_data['execCondDayList'][i])){
                        console.log('execCondDayList data')
                        return false
                    }
                }
                pre_data['execCondHour'] = pre_data['execCondHour']===null ? '' : pre_data['execCondHour']
                pre_data['execCondMin'] = pre_data['execCondMin']===null ? '' : pre_data['execCondMin']
                if(document.getElementsByName('inp_time')[0].value === ''){           // 시간 선택을 안했을 때
                    console.log('inp_time')
                    return false
                }else if(pre_data['execCondHour'] !== parseInt(workflow['execCondHour']) || pre_data['execCondMin'] !== parseInt(workflow['execCondMin'])){
                    console.log('execCondHour')
                    return false
                }
            }
        } else if(pre_data['execCondType'] === 'PERIOD_CRON'){
            if(document.querySelector(".cron_inp input").value !== pre_data['execCondCronExp']){
                console.log('execCondCronExp')
                return false
            }
        }else{      // EVENT_LISTEN
            if(document.querySelector(".status_inp input").value !== pre_data['execCondEventName']){
                console.log('execCondEventName')
                return false
            }
        }
    }

    if(pre_data['workflowStepList'].length !== workflow['workflowStepList'].length){
        console.log('workflowStepList')
        return false
    }else{
        for(let i=0;i<pre_data['workflowStepList'].length;i++){
            for(let x=0;x<pre_data['workflowStepList'][i]['moduleExecConfList'].length;x++){
                delete pre_data['workflowStepList'][i]['moduleExecConfList'][x].id
            }

            if(JSON.stringify(pre_data['workflowStepList'][i]['moduleExecConfList']) !== JSON.stringify(workflow['workflowStepList'][i]['moduleExecConfList'])){
                console.log('workflowStepList moduleExecConfList data')
                return false
            }
        }
    }

    return true
}

// 파일 이름 변경
$(function(){
    document.querySelectorAll(".icon li")[0].addEventListener("click",function () {
        if (document.getElementById("table_id").querySelectorAll("tbody tr td").length > 1) {
            let el = document.getElementById("table_id").querySelectorAll("tbody tr")
            for (let i = 0; i < el.length; i++) {
                if (el[i].classList.contains("backgroundColor_dfecfd")) {
                    preFileName = el[i].querySelectorAll("td")[0].querySelector("span").textContent
                    let fileNameChangeWidth = el[i].querySelectorAll("td")[0].querySelector("span").offsetWidth + 30
                    el[i].querySelectorAll("td")[0].innerHTML = '<input style="width: ' + fileNameChangeWidth + 'px" class="name_change" type="text" value= "' + el[i].querySelectorAll("td")[0].querySelector("span").textContent + '">'
                    el[i].querySelectorAll("td")[0].querySelector(".name_change").focus()
                    break
                }
            }
        }
    })
})


document.addEventListener("input",function(e){
    // 파일 및 폴더 이름 변경 입력창
    if(e.target.classList.contains("name_change")){
        let style = ''
        if(mouseClick === 'file'){
            style = 'left:126px;top:100px;'
        }else{
            style = 'left:50px;top:35px;'
        }
        let t = '<div class="word_hint" style="'+style+'">'
        t += '<p>'
        t += '파일 이름에는 다음 문자를 사용할 수 없습니다.<br>'
        t += '￦ / : * ? < > |'
        t += '</p>'
        t += '</div>'
        if(/\\|\/|:|\*|\?|<|>|\|/g.test(e.target.value)){
            e.target.parentNode.innerHTML += t
            setTimeout(function() {
                if(document.getElementsByClassName("word_hint").length > 0){
                    document.getElementsByClassName("word_hint")[0].remove()
                }
            }, 3000);
        }
        e.target.value = e.target.value.replace(/\\|\/|:|\*|\?|<|>|\|/g,'')
    }

})

document.onclick = function (e) {

    // 이름 바꾸기 버튼 클릭
    if(e.target.classList.contains("change")){
        let el = document.getElementsByClassName("/")[0].getElementsByTagName('span')
        for (let i = 0; i < el.length; i++) {
            if (el[i].classList.contains("backgroundColor_dfecfd")) {
                if (el[i].textContent === '/') {
                    document.querySelector(".warning_modal_bg .warning_txt").textContent = 'root는 이름을 변경할 수 없습니다'
                    document.querySelector(".warning_modal_bg").style.display = 'inline'
                } else {
                    preFileName = el[i].querySelector("p").textContent
                    let fileNameChangeWidth = el[i].querySelector("p").clientWidth + 30

                    el[i].innerHTML += '<input style="width: ' + fileNameChangeWidth + 'px" class="name_change" type="text" value= "' + el[i].querySelector("p").textContent + '">'
                    el[i].querySelector("p").remove()
                    el[i].querySelector(".name_change").focus()
                }
                break;
            }
        }
    }

    // 폴더 및 파일 변경 도중 입력창 외 다른 위치 클릭시 입력창 저장하지 않고 닫힘
    if (!e.target.classList.contains("change") && !(e.target.classList.contains("file_change") || e.target.parentNode.classList.contains("file_change")) && !e.target.classList.contains("name_change") && document.getElementsByClassName("name_change").length === 1) {

        if (document.getElementsByClassName("name_change")[0].parentNode.tagName === 'SPAN') {
            let folderName = document.querySelector(".name_change").value
            let parentPath = document.querySelector(".name_change").parentNode.querySelector("label").getAttribute("for").split("/")

            let parentDirPath = ''
            for (let i = 0; i < parentPath.length - 1; i++) {
                parentDirPath += parentPath[i]
                if (parentPath.length - 2 === i) {
                    parentDirPath += '/'
                }
            }

            nameChange(parentDirPath, preFileName, folderName)

            document.querySelector(".name_change").parentNode.innerHTML += '<p>' + folderName + '</p>'
            if(document.getElementsByClassName("word_hint").length > 0){
                document.getElementsByClassName("word_hint")[0].remove()
            }
            document.querySelector(".name_change").remove()


            document.getElementsByClassName(parentDirPath+preFileName)[0].className = parentDirPath+folderName
            document.getElementById(parentDirPath+preFileName).id = parentDirPath+folderName
            document.getElementsByClassName(parentDirPath+folderName)[0].childNodes[1].querySelector("label").htmlFor = parentDirPath+folderName
        } else {
            let fileName = document.querySelector(".name_change").value
            let parentDirPath = document.querySelector(".tree_all").title

            // console.log(parentDirPath)
            // console.log(preFileName)
            // console.log(fileName)

            nameChange(parentDirPath, preFileName, fileName)

            document.querySelector(".name_change").parentNode.innerHTML = '<span>' + fileName + '</span>'

        }
    }
}



// keydown 이벤트 처리
document.onkeydown = function (e) {
    if (e.key === 'Escape') {           // Esc
        if (mouseClick === 'folder') {
            let el = document.getElementsByClassName("/")[0].getElementsByTagName('span')
            for (let i = 0; i < el.length; i++) {
                if (el[i].classList.contains("backgroundColor_dfecfd")) {
                    el[i].innerHTML += '<p>' + preFileName + '</p>'
                    el[i].querySelector(".name_change").remove()
                    break;
                }
            }
        } else if (mouseClick === 'file') {
            if (document.getElementById("table_id").querySelectorAll("tbody tr td").length > 1) {
                let el = document.getElementById("table_id").querySelectorAll("tbody tr")
                for (let i = 0; i < el.length; i++) {
                    if (el[i].classList.contains("backgroundColor_dfecfd")) {
                        el[i].querySelectorAll("td")[0].innerHTML = '<span>' + preFileName + '</span>'
                        break
                    }
                }
            }
        }
    }
    if (e.key === "F2" && document.getElementsByClassName("name_change").length === 0) {
        if (mouseClick === 'folder') {
            let el = document.getElementsByClassName("/")[0].getElementsByTagName('span')
            for (let i = 0; i < el.length; i++) {
                if (el[i].classList.contains("backgroundColor_dfecfd")) {
                    if (el[i].textContent === '/') {
                        document.querySelector(".warning_modal_bg .warning_txt").textContent = 'root는 이름을 변경할 수 없습니다'
                        document.querySelector(".warning_modal_bg").style.display = 'inline'
                    } else {
                        preFileName = el[i].querySelector("p").textContent
                        let fileNameChangeWidth = el[i].querySelector("p").clientWidth + 30

                        el[i].innerHTML += '<input style="width: ' + fileNameChangeWidth + 'px" class="name_change" type="text" value= "' + el[i].querySelector("p").textContent + '">'
                        el[i].querySelector("p").remove()
                        el[i].querySelector(".name_change").focus()
                    }
                    break;
                }
            }
        } else if (mouseClick === 'file') {
            if (document.getElementById("table_id").querySelectorAll("tbody tr td").length > 1) {
                let el = document.getElementById("table_id").querySelectorAll("tbody tr")
                for (let i = 0; i < el.length; i++) {
                    if (el[i].classList.contains("backgroundColor_dfecfd")) {
                        preFileName = el[i].querySelectorAll("td")[0].querySelector("span").textContent
                        let fileNameChangeWidth = el[i].querySelectorAll("td")[0].querySelector("span").offsetWidth + 30
                        el[i].querySelectorAll("td")[0].innerHTML = '<input style="width: ' + fileNameChangeWidth + 'px" class="name_change" type="text" value= "' + el[i].querySelectorAll("td")[0].querySelector("span").textContent + '">'
                        el[i].querySelectorAll("td")[0].querySelector(".name_change").focus()
                        break
                    }
                }
            }
        }

    }
    if (e.key === 'Enter' && document.getElementsByClassName("name_change").length === 1) {
        if (mouseClick === 'folder') {
            let el = document.getElementsByClassName("/")[0].getElementsByTagName('span')
            for (let i = 0; i < el.length; i++) {
                if (el[i].classList.contains("backgroundColor_dfecfd")) {
                    if (el[i].textContent === '/') {
                        alert('root는 이름을 변경할 수 없습니다')
                    } else {
                        let fileNames = preFileName.split("/")
                        let parentDirPath = '/'
                        for (let i = 0; i < fileNames.length - 1; i++) {
                            parentDirPath += fileNames[i]
                            if (fileNames.length - 2 === i) {
                                parentDirPath += '/'
                            }
                        }
                        nameChange(parentDirPath, fileNames[fileNames.length - 1], el[i].querySelector(".name_change").value)
                        el[i].innerHTML += '<p>' + el[i].querySelector(".name_change").value + '</p>'
                        el[i].querySelector(".name_change").remove()
                    }
                    break;
                }
            }
        } else if (mouseClick === 'file') {
            if (document.getElementById("table_id").querySelectorAll("tbody tr td").length > 1) {
                let el = document.getElementById("table_id").querySelectorAll("tbody tr")
                for (let i = 0; i < el.length; i++) {
                    if (el[i].classList.contains("backgroundColor_dfecfd")) {
                        let fileName = el[i].querySelectorAll("td")[0].querySelector(".name_change").value

                        nameChange(document.querySelector(".tree_all").title, preFileName, fileName)

                        el[i].querySelectorAll("td")[0].innerHTML = '<span>' + fileName + '</span>'
                        break
                    }
                }
            }
        }
    }
}

// 파일 업로드
$(function () {

    // 파일 업로드
    document.querySelectorAll('.icon li')[1].addEventListener('click', function () {
        fileUpload()
    });

    // 파일 업로드 박스안에 drag시 파일 복사 방지
    document.body.addEventListener("dragover", function (e) {

        let el = e.target
        for (let i = 0; i < 6; i++) {
            if (el.nodeName === 'BODY' || el.nodeName === 'HTML') {       // 마우스가 body에 갔을 때 테투리 없어짐
                document.documentElement.style.setProperty("--border-none", '1px solid rgba(0, 0, 0, 0.3)');
                document.getElementsByClassName("dataTables_scrollBody")[0].style.border = "0"
                break
            }
            if (el.classList.contains("dataTables_scrollBody")) {
                e.preventDefault();
                document.documentElement.style.setProperty("--border-none", '1px solid white');
                document.getElementsByClassName("dataTables_scrollBody")[0].style.border = "2px dashed #c8c8c8"
                break
            }
            el = el.parentNode
            if (i === 5) {          // 마우스가 body에 갔을 때 테투리 없어짐
                if (table_id.rows().count() > 0) {
                    document.documentElement.style.setProperty("--border-none", '1px solid rgba(0, 0, 0, 0.3)');
                    document.getElementsByClassName("dataTables_scrollBody")[0].style.border = "0"
                }
            }
        }
    })
    document.body.addEventListener("dragleave", function (e) {

        if (e.clientX === 0 && table_id.rows().count() > 0) {
            document.documentElement.style.setProperty("--border-none", '1px solid rgba(0, 0, 0, 0.3)');
            document.getElementsByClassName("dataTables_scrollBody")[0].style.border = "0"
        }
    })


    document.body.addEventListener("drop", function (e) {
        // document.querySelector(".module_load_modal_bg").style.display = 'none'
        let el = e.target
        for (let i = 0; i < 6; i++) {
            if (el.nodeName === 'BODY' || el.nodeName === 'HTML') {       // 마우스가 body에 갔을 때 테투리 없어짐
                document.documentElement.style.setProperty("--border-none", '1px solid rgba(0, 0, 0, 0.3)');
                document.getElementsByClassName("dataTables_scrollBody")[0].style.border = "0"
                break
            }
            if (el.classList.contains("dataTables_scrollBody")) {
                $(".upload_modal .progress").val(0)
                document.getElementsByClassName('upload_file_all')[0].innerHTML = '<ul class="upload_file_list"></ul>'
                e.preventDefault()
                upload_files = e.dataTransfer.files

                let parentDirPath = document.querySelector(".tree_all").title
                let existsFileResult = []
                let file_cnt = upload_files.length
                file_name_check(0, file_cnt)
                function file_name_check(i, file_cnt) {

                    let fileName = upload_files[i].name

                    $.ajax({
                        type: "post",
                        url: "file/existsFile",
                        async: "false",
                        data: { parentDirPath: parentDirPath, fileName: fileName },
                        success: function (data) {
                            if (data) {
                                existsFileResult.push(fileName)
                                $(".upload_file_list").append('<li class="duplication">' + fileName + ' <span>(중복된 파일명)</span></li>')

                            }else{
                                $(".upload_file_list").append('<li>' + fileName + '</li>')
                            }
                            if (i !== file_cnt - 1) {
                                file_name_check(i + 1, file_cnt)
                            }
                            document.querySelector(".upload_modal_bg").style.display = 'inline'
                        },
                        error: function (error) {
                            document.getElementsByClassName("warning_txt")[0].textContent = '중복 파일 확인 중 에러가 났습니다'
                            document.getElementsByClassName("warning_modal_bg")[0].style.display = 'inline'
                        }
                    })
                }
            }
            el = el.parentNode
            if (i === 5) {          // 마우스가 body에 갔을 때 테투리 없어짐
                if (table_id.rows().count() > 0) {
                    document.documentElement.style.setProperty("--border-none", '1px solid rgba(0, 0, 0, 0.3)');
                    document.getElementsByClassName("dataTables_scrollBody")[0].style.border = "0"
                }
            }
        }
    })


    $('.upload_modal img').click(function () {
        $('.upload_modal_bg').stop().fadeOut();
    });
    $('.upload_modal_btn_list>li').eq(0).click(function () {
        $('.upload_modal_bg').stop().fadeOut();
    });
    $('.upload_modal_btn_list>li').eq(1).click(function () {
        let parentDirPath = document.querySelector(".tree_all").title

        let form = $("#formUploadFile")[0];
        let formData = new FormData(form);
        formData.append("parentDirPath", parentDirPath);
        formData.append("uploadFile", upload_files[0]);

        $(".upload_modal .progress").val(0)
        file_upload(formData, 0)

        function file_upload(formData, c) {
            $.ajax({
                type: "post",
                url: "/file/uploadFile",
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                data: formData,
                xhr: function () {  //xhr 설정
                    let xhr = $.ajaxSettings.xhr()  //ajax에서 xhr객체를 가져 옵니다.

                    xhr.upload.onprogress = function (e) {  //프로그래스 콜백 함수에서 뭐할지 정의하여 줍니다.
                        let percent = e.loaded / e.total * 100 //도달한 값에서 총 값을 나눈뒤 100을 곱하여 줍니다.(백분율)
                        $(".upload_modal .progress").val(percent)

                    }
                    return xhr  //정의된 xhr을 리턴하여 ajax에서 사용하도록 합니다.
                },
                success: function (data) {
                    if (typeof (upload_files.length) !== 'number') {
                        $(".upload_modal .progress").val(100)
                        document.querySelector(".upload_modal_bg").style.display = 'none'
                        document.getElementsByClassName("complete_txt")[0].textContent = '파일 업로드 완료 되었습니다'
                        document.getElementsByClassName("complete_modal_bg")[0].style.display = 'inline'

                        //  파일목록 표출
                        showChildFileList(parentDirPath);
                    } else {

                        if (upload_files.length - 1 === c) {
                            $(".upload_modal .progress").val(100)
                            document.querySelector(".upload_modal_bg").style.display = 'none'
                            document.getElementsByClassName("complete_txt")[0].textContent = '파일 업로드 완료 되었습니다'
                            document.getElementsByClassName("complete_modal_bg")[0].style.display = 'inline'

                            //  파일목록 표출
                            showChildFileList(parentDirPath);
                        } else {
                            c += 1
                            console.log(upload_files[c])
                            let form = $("#formUploadFile")[0];
                            let formData = new FormData(form);
                            formData.append("parentDirPath", parentDirPath);
                            formData.append("uploadFile", upload_files[c]);

                            $(".upload_modal .progress").val(0)
                            file_upload(formData, c)

                        }
                    }
                },
                error: function (error) {
                    document.getElementsByClassName("warning_txt")[0].textContent = '파일 업로드 중 오류가 발생하였습니다.'
                    document.getElementsByClassName("warning_modal_bg")[0].style.display = 'inline'
                }
            })
        }
    });




});


// 중복확인 함수
function fileUpload() {

    if (document.querySelectorAll('#formUploadFile').length > 0) {
        let el = document.querySelectorAll('#formUploadFile')
        for (let i = 0; i < el.length; i++) {
            el[0].remove();
        }
    }

    document.getElementsByClassName("progress")[0].value = 0

    let newForm = $('<form></form>');
    newForm.attr("id", "formUploadFile");
    newForm.attr("name", "newForm");
    newForm.attr("method", "post");
    newForm.attr("action", "/fileManage/uploadFile");
    newForm.attr("target", "_blank");
    newForm.attr("enctype", "multipart/form-data");
    // file input 생성
    newForm.append($("<input/>", { type: 'file', name: 'uploadFile', id: 'uploadFile', style: "visibility: hidden", multiple: "multiple" }));
    // form 삽입
    newForm.appendTo('body');
    //---</>파일전송용 form 생성 및 설정>---

    //  업로드 파일 선택을 위한 클릭
    $("#formUploadFile input").click();

    //  업로드 파일 선택이 완료되었을 경우, 이벤트 핸들링
    $("#formUploadFile input").change(function () {
        // document.querySelector(".module_load_modal_bg").style.display = 'none'
        document.getElementsByClassName('upload_file_all')[0].innerHTML = '<ul class="upload_file_list"></ul>'
        if (document.querySelector(".upload_file") !== null) {
            document.querySelector(".upload_file").remove()
        }
        let parentDirPath = document.querySelector(".tree_all").title
        let form = $("#formUploadFile")[0];
        let formData = new FormData(form);
        formData.append("parentDirPath", parentDirPath);
        formData.append("uploadFile", $("#uploadFile")[0].files[0]);
        upload_files = $("#uploadFile")[0].files[0]

        let existsFileResult = [];

        for (let i = 0; i < $("#uploadFile")[0].files.length; i++) {
            let fileName = $("#uploadFile")[0].files[i].name
            $.ajax({
                type: "post",
                url: "file/existsFile",
                async: "false",
                data: { parentDirPath: parentDirPath, fileName: fileName },
                success: function (data) {

                    $(".upload_modal .progress").val(0)
                    if (data) {
                        existsFileResult.push(fileName)
                        $(".upload_file_list").append('<li class="duplication">' + fileName + ' <span>(중복된 파일명)</span></li>')
                    }else{
                        $(".upload_file_list").append('<li>' + fileName + '</li>')
                    }
                    if (i === $("#uploadFile")[0].files.length - 1) {
                        formData.append("existsFileResult", existsFileResult);
                    }
                    document.querySelector(".upload_modal_bg").style.display = 'inline'
                },
                error: function (error) {
                    document.getElementsByClassName("warning_txt")[0].textContent = '중복 파일 확인 중 에러가 났습니다'
                    document.getElementsByClassName("warning_modal_bg")[0].style.display = 'inline'
                }
            })

        }

    });
}

/**
 부보, 이름, 뉴이름
 **/
function nameChange(parentDirPath, fileName, reFileName) {
    $.ajax({
        type: "post",
        url: "file/nameChange",
        async: "false",
        data: {
            parentDirPath: parentDirPath,
            fileName: fileName,
            fileName2: reFileName
        },
        success: function (data) {
        },
        error: function (error) {
            document.getElementsByClassName("warning_txt")[0].textContent = '중복 파일 확인 중 에러가 났습니다'
            document.getElementsByClassName("warning_modal_bg")[0].style.display = 'inline'
        }
    })
}