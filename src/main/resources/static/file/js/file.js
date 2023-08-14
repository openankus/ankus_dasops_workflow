let upload_files = null
let table_id    // 데이터 테이블
let preFileName = '/'       // 이전 파일 명 저장
let mouseClick = 'folder'         // 마우스 클릭한 위치


document.addEventListener("input",function(e){
    // 파일 및 폴더 이름 변경 입력창
    if(e.target.classList.contains("name_change")){
        let style = ''
        if(mouseClick === 'file'){
            style = 'left:126px;top:50px;'
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
    if(e.target.classList.contains("change") ){
        // 파일을 이름 변경 중일때 변경 완료 처리 진행
        if(document.querySelectorAll("#table_id .name_change").length > 0){
            let fileName = document.querySelector(".name_change").value
            let parentDirPath = document.querySelector(".main_left input").value


            nameChange(parentDirPath, preFileName, fileName)

            document.querySelector(".name_change").parentNode.innerHTML = '<label>' + fileName + '</label>'

            if(document.getElementsByClassName("word_hint").length > 0){
                document.getElementsByClassName("word_hint")[0].remove()
            }

            let el = document.getElementsByName("check")
            for(let i=0;i<el.length;i++){
                el[i].checked = false
            }
        }
        // 폴더명을 변경 중이 아닐때 동작
        if(document.querySelectorAll(".tree_all .name_change").length === 0){
            let el = document.getElementsByClassName("/")[0].getElementsByTagName('span')
            for (let i = 0; i < el.length; i++) {
                if (el[i].classList.contains("backgroundColor_c0dbff")) {
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
    }

    // 폴더 및 파일 이름 변경 후 다른 다른 위치 클릭시 저장됨
    if (!e.target.classList.contains("change") && !(e.target.classList.contains("file_change") || e.target.parentNode.classList.contains("file_change")) && !e.target.classList.contains("name_change") && document.getElementsByClassName("name_change").length === 1) {

        if (document.getElementsByClassName("name_change")[0].parentNode.tagName === 'SPAN') {      // 폴더 변경일때
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
            document.querySelector(".main_left input").value = parentDirPath+folderName
        } else {        // 파일 변경일때
            let fileName = document.querySelector(".name_change").value
            let parentDirPath = document.querySelector(".main_left input").value


            nameChange(parentDirPath, preFileName, fileName)

            document.querySelector(".name_change").parentNode.innerHTML = '<label>' + fileName + '</label>'

            if(document.getElementsByClassName("word_hint").length > 0){
                document.getElementsByClassName("word_hint")[0].remove()
            }

        }
    }
}



// keydown 이벤트 처리
document.onkeydown = function (e) {
    if (e.key === 'Escape') {           // Esc
        if (mouseClick === 'folder') {
            let el = document.getElementsByClassName("/")[0].getElementsByTagName('span')
            for (let i = 0; i < el.length; i++) {
                if (el[i].classList.contains("backgroundColor_c0dbff")) {
                    el[i].innerHTML += '<p>' + preFileName + '</p>'
                    el[i].querySelector(".name_change").remove()
                    break;
                }
            }
        } else if (mouseClick === 'file') {
            if (document.getElementById("table_id").querySelectorAll("tbody tr td").length > 1) {
                let el = document.getElementById("table_id").querySelectorAll("tbody tr")
                for (let i = 0; i < el.length; i++) {
                    if (el[i].classList.contains("backgroundColor_c0dbff")) {
                        el[i].querySelectorAll("td")[1].innerHTML = '<label>' + preFileName + '</label>'
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
                if (el[i].classList.contains("backgroundColor_c0dbff")) {
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
                    if (el[i].classList.contains("backgroundColor_c0dbff")) {
                        preFileName = el[i].querySelectorAll("td")[1].querySelector("label").textContent
                        let fileNameChangeWidth = el[i].querySelectorAll("td")[1].querySelector("label").offsetWidth + 30
                        el[i].querySelectorAll("td")[1].innerHTML = '<input style="width: ' + fileNameChangeWidth + 'px" class="name_change" type="text" value= "' + el[i].querySelectorAll("td")[1].querySelector("label").textContent + '">'
                        el[i].querySelectorAll("td")[1].querySelector(".name_change").focus()
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
                if (el[i].classList.contains("backgroundColor_c0dbff")) {
                    if (el[i].textContent === '/') {
                        alert('root는 이름을 변경할 수 없습니다')
                    } else {
                        let fileNames = preFileName.split("/")
                        let folderName = el[i].querySelector(".name_change").value
                        let parentDirPath = '/'
                        for (let i = 0; i < fileNames.length - 1; i++) {
                            parentDirPath += fileNames[i]
                            if (fileNames.length - 2 === i) {
                                parentDirPath += '/'
                            }
                        }
                        nameChange(parentDirPath, fileNames[fileNames.length - 1], folderName)
                        el[i].innerHTML += '<p>' + el[i].querySelector(".name_change").value + '</p>'
                        el[i].querySelector(".name_change").remove()



                        if(document.getElementsByClassName("word_hint").length > 0){
                            document.getElementsByClassName("word_hint")[0].remove()
                        }


                        document.getElementsByClassName(parentDirPath+fileNames[fileNames.length - 1])[0].className = parentDirPath+folderName
                        document.getElementById(parentDirPath+fileNames[fileNames.length - 1]).id = parentDirPath+folderName
                        document.getElementsByClassName(parentDirPath+folderName)[0].childNodes[1].querySelector("label").htmlFor = parentDirPath+folderName
                        document.querySelector(".main_left input").value = parentDirPath+folderName
                    }
                    break;
                }
            }
        } else if (mouseClick === 'file') {
            if (document.getElementById("table_id").querySelectorAll("tbody tr td").length > 1) {
                let el = document.getElementById("table_id").querySelectorAll("tbody tr")
                for (let i = 0; i < el.length; i++) {
                    if (el[i].classList.contains("backgroundColor_c0dbff")) {
                        let fileName = el[i].querySelectorAll("td")[1].querySelector(".name_change").value
                        let parentDirPath = document.querySelector(".main_left input").value

                        nameChange(document.querySelector(".main_left input").value, preFileName, fileName)

                        el[i].querySelectorAll("td")[1].innerHTML = '<label>' + fileName + '</label>'


                        if(document.getElementsByClassName("word_hint").length > 0){
                            document.getElementsByClassName("word_hint")[0].remove()
                        }

                        break
                    }
                }
            }
        }
    }
}


$(function () {
    // 파일 로드
    fileLoad("/");

    // 체크박스
    document.querySelector("input[name=checkAll]").addEventListener("change", function (e) {
        e.preventDefault();
        let list = document.querySelectorAll("input[name=check]");
        for (let i = 0; i < list.length; i++) {
            list[i].checked = this.checked;
        }
    });

    // 폴더 위치 클릭함
    document.getElementsByClassName("tree_all")[0].addEventListener("click", function (e) {
        mouseClick = 'folder'
    })

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

                let parentDirPath = document.querySelector(".main_left input").value
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


})


// 모달 팝업
$(function () {
    $('.add').click(function () {
        $('.create_modal_bg').stop().fadeIn();
    });
    $('.create_modal img').click(function () {
        $('.create_modal_bg').stop().fadeOut();
    });
    $('.create_modal_btn_list>li').eq(0).click(function () {
        $('.create_modal_bg').stop().fadeOut();
    });
    $('.create_modal_btn_list>li').eq(1).click(function () {
        if (document.querySelector(".create_modal input").value !== "") {
            let parentDirPath = document.querySelector(".main_left input").value
            let dirName = document.querySelector(".create_modal input").value

            //  폴더생성 요청
            $.ajax({
                type: "get",
                url: "/file/createDir",
                data: {
                    "parentDirPath": parentDirPath,
                    "dirName": dirName,
                },
                success: function (data) {
                    if (data === "완료") {

                        let parentPaddingLeft = parseInt(document.getElementsByClassName(parentDirPath)[0].getElementsByTagName('label')[0].style.paddingLeft.replace("px", "")) + 16
                        let path = parentDirPath !== "/" ? parentDirPath + "/" + dirName : parentDirPath + dirName
                        let t = '<ul>' +
                            '<li class="' + path + '" >' +
                            '<input type="checkbox" id="' + path + '" checked>' +
                            '<span><label for="' + path + '" style="padding-left: ' + parentPaddingLeft + 'px;"></label>' +
                            '<img src="/common/images/file/file.svg" alt="파일"> <p>' + dirName + '</p></span>' +
                            '</li>' +
                            '</ul>'

                        document.getElementsByClassName("" + parentDirPath)[0].innerHTML += t;
                        document.getElementsByClassName("complete_txt")[0].textContent = '폴더 추가를 완료하였습니다'
                        document.getElementsByClassName("complete_modal_bg")[0].style.display = 'inline'
                        document.querySelector('.create_modal input').value = ''


                        document.getElementById(parentDirPath).checked = false
                        document.querySelector(".main_left input").value = path
                        showChildFileList(path)

                        // 파일 관린창에 있는 backgroundColor_c0dbff class 모두 지우기
                        let el = document.getElementsByClassName('/')[0].getElementsByTagName('span')
                        for (let i = 0; i < el.length; i++) {
                            el[i].classList.remove('backgroundColor_c0dbff')
                        }

                        document.getElementsByClassName(path)[0].getElementsByTagName('span')[0].classList.add('backgroundColor_c0dbff')
                        $('.create_modal_bg').stop().fadeOut();
                    } else if (data === "해당 이름이 이미 존재 합니다") {
                        $('.create_modal_bg').stop().fadeOut();
                        document.querySelector('.warning_modal_bg .warning_txt').textContent = data
                        document.querySelector('.warning_modal_bg').style.display = 'inline'
                    } else {
                        $('.create_modal_bg').stop().fadeOut();
                        document.querySelector('.warning_modal_bg .warning_txt').textContent = "'" + dirName + "' 폴더 생성 중 오류가 발생였습니다."
                        document.querySelector('.warning_modal_bg').style.display = 'inline'
                    }
                },
                error: function (error) {
                    $('.create_modal_bg').stop().fadeOut();
                    document.querySelector('.warning_modal_bg .warning_txt').textContent = "'" + dirName + "' 폴더 생성 중 오류가 발생였습니다."
                    document.querySelector('.warning_modal_bg').style.display = 'inline'
                }
            });

        } else {
            document.getElementsByClassName('n_create_modal')[0].style.display = 'inline'
        }
    });

    document.querySelector(".create_modal input").addEventListener("input", function () {
        if (this.value.replace(/ /g, "") === "") {
            document.querySelectorAll(".create_modal_btn_list button")[1].disabled = true
            document.querySelectorAll(".create_modal_btn_list button")[1].classList.add("save_disabled")
        } else {
            document.querySelectorAll(".create_modal_btn_list button")[1].disabled = false
            document.querySelectorAll(".create_modal_btn_list button")[1].classList.remove("save_disabled")
        }
    })

    document.querySelector('.n_create_modal button').addEventListener('click', function () {
        document.getElementsByClassName('n_create_modal')[0].style.display = 'none'
    })
    document.querySelector('.n_create_modal img').addEventListener('click', function () {
        document.getElementsByClassName('n_create_modal')[0].style.display = 'none'
    })

});

// 파일 업로드
$(function () {
    $('.upload_modal img').click(function () {
        $('.upload_modal_bg').stop().fadeOut();
    });
    $('.upload_modal_btn_list>li').eq(0).click(function () {
        $('.upload_modal_bg').stop().fadeOut();
    });
    $('.upload_modal_btn_list>li').eq(1).click(function () {
        let parentDirPath = document.querySelector(".main_left input").value

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

// 파일 다운로드 모달창 버튼 이벤트
$(function () {
    document.querySelector(".download_modal img").addEventListener("click", function () {
        document.querySelector(".download_modal_bg").style.display = 'inline'
    })
    document.querySelectorAll(".download_modal_btn_list button")[0].addEventListener("click", function () {
        document.querySelector(".download_modal_bg").style.display = 'none'
    })
    document.querySelectorAll(".download_modal_bg img")[0].addEventListener("click", function () {
        document.querySelector(".download_modal_bg").style.display = 'none'
    })
    document.querySelectorAll(".download_modal_btn_list button")[1].addEventListener("click", function () {
        fileDownload();
    })
});



// 폴더 삭제
$(function () {

    $('.delete').click(function () {
        document.getElementsByClassName("delete_txt")[0].innerHTML = '선택한 폴더를 <br> 정말 삭제하시겠습니까?'
        $('.delete_modal_bg').stop().fadeIn();
    });
    $('.delete_modal_bg .modal_btn_list>li').eq(0).click(function () {
        $('.delete_modal_bg').stop().fadeOut();
    });
    $('.delete_modal_bg img').eq(0).click(function () {
        $('.delete_modal_bg').stop().fadeOut();
    });
    $('.delete_modal_bg .modal_btn_list>li').eq(1).click(function () {
        if (document.getElementsByClassName("delete_txt")[0].innerHTML.includes('파일')) {
            fileDel();
        } else {
            folderDel();
        }
    });
});

window.onload = function () {
    // jupyter 열기
    document.getElementById("table_id").addEventListener("click", function (e) {
        if (e.target.nodeName === "SPAN" && e.target.textContent === '열기') {
            e.target.lastChild.style.display = 'inline'
            $.ajax({
                type: "get",
                url: "/file/getJupyterlabUrl",
                data: { "filePath": e.target.title },
                //                async:false,
                success: function (data) {
                    //  JupyterLab URL로 새로운 창 열기
                    console.log(data)
                    let pop = window.open(data, "_blank");

                    e.target.lastChild.style.display = 'none'
                },
                error: function (error) {
                    document.querySelector('.warning_modal_bg .warning_txt').textContent = "파일 열기를 실패하였습니다."
                    document.querySelector('.warning_modal_bg').style.display = 'inline'
                }
            });
        }
    })

    document.getElementsByClassName("/")[0].addEventListener("click", function (e) {
        if (e.target.nodeName === "INPUT" && e.target.type === 'checkbox') {
            document.querySelector(".main_left input").value = e.target.id
            showChildFileList(e.target.id)
            let el = document.getElementsByClassName('/')[0].getElementsByTagName('span')
            for (let i = 0; i < el.length; i++) {
                el[i].classList.remove('backgroundColor_c0dbff')
            }
            document.getElementsByClassName(e.target.id)[0].children[1].classList.add('backgroundColor_c0dbff')

        }
        if (e.target.nodeName === "SPAN") {
            document.querySelector(".main_left input").value = e.target.previousElementSibling.id
            showChildFileList(e.target.previousElementSibling.id)
            let el = document.getElementsByClassName('/')[0].getElementsByTagName('span')
            for (let i = 0; i < el.length; i++) {
                el[i].classList.remove('backgroundColor_c0dbff')
            }
            document.getElementsByClassName(e.target.previousElementSibling.id)[0].children[1].classList.add('backgroundColor_c0dbff')
        }
        if (e.target.nodeName === "IMG" || e.target.nodeName === "P") {
            document.querySelector(".main_left input").value = e.target.parentNode.previousElementSibling.id
            showChildFileList(e.target.parentNode.previousElementSibling.id)
            let el = document.getElementsByClassName('/')[0].getElementsByTagName('span')
            for (let i = 0; i < el.length; i++) {
                el[i].classList.remove('backgroundColor_c0dbff')
            }
            document.getElementsByClassName(e.target.parentNode.previousElementSibling.id)[0].children[1].classList.add('backgroundColor_c0dbff')
        }
    })

    // "? 파일이 선택되지 않았습니다." 보여주는 모달창 닫기
    document.querySelector(".warning_modal button").addEventListener("click", function () {
        document.getElementsByClassName("warning_modal_bg")[0].style.display = 'none'
    })

    document.querySelector(".warning_modal img").addEventListener("click", function () {
        document.getElementsByClassName("warning_modal_bg")[0].style.display = 'none'
    })


    // 완료 모달창 닫기
    document.querySelector(".complete_modal button").addEventListener("click", function () {
        document.getElementsByClassName("complete_modal_bg")[0].style.display = 'none'
    })

    document.querySelector(".complete_modal img").addEventListener("click", function () {
        document.getElementsByClassName("complete_modal_bg")[0].style.display = 'none'
    })



}

function fileLoad(parentDirPath) {
    if (parentDirPath === "/") {
        document.querySelector('.main_left input').value = parentDirPath
        showChildFileList(parentDirPath);
    }
    $.ajax({
        url: "file/listChildDir",
        type: "post",
        data: { parentDirPath: parentDirPath },
        success: function (data) {

            data = JSON.parse(data)
            if (data.length > 0) {
                let t = ""
                let parentPaddingLeft = parseInt(document.getElementsByClassName(parentDirPath)[0].getElementsByTagName('label')[0].style.paddingLeft.replace("px", "")) + 16
                for (let i = 0; i < data.length; i++) {
                    t += '<ul>' +
                        '<li class="' + (parentDirPath === "/" ? parentDirPath : parentDirPath + "/") + data[i]['title'] + '" >' +
                        '<input type="checkbox" id="' + (parentDirPath === "/" ? parentDirPath : parentDirPath + "/") + data[i]['title'] + '" checked>' +
                        '<span><label for="' + (parentDirPath === "/" ? parentDirPath : parentDirPath + "/") + data[i]['title'] + '" style="padding-left: ' + parentPaddingLeft + 'px;"></label>' +
                        '<img src="/common/images/file/file.svg" alt="파일"> <p>' + data[i]['title'] + '</p></span>' +
                        '</li>' +
                        '</ul>'
                }
                document.getElementsByClassName("" + parentDirPath)[0].innerHTML += t
                for (let i = 0; i < data.length; i++) {
                    fileLoad((parentDirPath === "/" ? parentDirPath : parentDirPath + "/") + data[i]['title'])
                }


            }

        },
        error: function (err) {
            console.log(err)
        }
    })
}

/**
 * 자식 파일 목록을 보여주기
 *
 * @param parentDirPath 부모 디렉터리 경로(사용자 작업공간 기준 상대경로)
 */
function showChildFileList(parentDirPath) {
    table_id = $('#table_id').DataTable({
        processing: true,
        serverSide: true,
        paging: false,
        searching: false,
        info: false,
        destroy: true,
        responsive: true,
        orderable: true,
        scrollY: 548,
        order: [1, 'asc'],
        dom: '<"dt_title">fti',      // table 안에 있는 caption 활성화(datatable 생성 코드 종료 후 추가 코드 $("div.dt_title").html('') 필요 )
        language: { "zeroRecords": '<div class="filelist0">파일을 여기에 끌어서 넣으세요.</div>' },
        ajax: {
            "url": "/file/listChildFile",
            "type": "POST",
            "data": { "parentDirPath": parentDirPath },
            "dataSrc": function (res) {
                if (res.length === 0) {
                    document.documentElement.style.setProperty("--drag_txt-none", 'inline');
                    document.documentElement.style.setProperty("--border-none", '1px solid white');
                } else {
                    document.documentElement.style.setProperty("--drag_txt-none", 'none');
                    document.documentElement.style.setProperty("--border-none", '1px solid rgba(0, 0, 0, 0.3)');
                }
                return res;
            }
        },
        columns: [
            { data: 'del' },
            { data: 'name' },
            { data: 'date' },
            { data: 'path' }
        ],
        columnDefs: [
            {
                targets: [0, 1, 2, 3],
                className: "dt-center",

            },
            {

                targets: [0],
                width: "10%",
                searchable: false,
                orderable: false,
                checkboxes: { selectRow: true },
                render: function (data, type, full, meta) {
                    return '<input  type="checkbox" value="' + data + '" name="check" >';
                }
            },
            {
                targets: [1],
                width: "35%",
                render: function (data, type, full, meta) {
                    return '<label>' + data + '</label>';
                }
            },
            {
                targets: [2],
                width: "25%",
            },
            {
                targets: [3],
                searchable: false,
                orderable: false,
                width: "25%",
                checkboxes: { selectRow: true },
                render: function (data, type, full, meta) {

                    let result = ''
                    let s = data.split(".")

                    //  파일열기 버튼 활성화
                    if (s[s.length - 1] === 'ipynb' || s[s.length - 1] === 'py') { result = '<span title="' + data + '">열기<img class="gif" src="/common/images/file/loading.gif" alt="로딩"></span>' }
                    return result;
                }
            },
        ]

    });
    table_id.on('click', 'tr', function (e) {
        if(e.target.name === "check") {
            this.classList.add("backgroundColor_c0dbff")
            if(!e.target.checked) this.classList.remove("backgroundColor_c0dbff")
        }
        mouseClick = 'file'
    })

    document.getElementsByName("checkAll")[0].addEventListener("click",function (e) {
        if(e.target.checked){
            let el = document.querySelectorAll("tbody tr")
            for(let i=0;i<el.length;i++){
                el[i].classList.add("backgroundColor_c0dbff")
                console.log(el[i].classList)
            }
        }else{
            let el = document.querySelectorAll("tbody tr")
            for(let i=0;i<el.length;i++){
                el[i].classList.remove("backgroundColor_c0dbff")
            }
        }
    })
    $("div .dt_title").html('<div class="right_top">' +
        '            <h3>폴더 내 파일</h3>' +
        '            <ul class="icon">' +
        '              <li class="file_change"><img src="../common/images/file/file_change.svg" alt="파일 이름 바꾸기"><span>파일 이름 바꾸기</span></li>'+
        '              <li><img src="/common/images/file/upload.svg" alt="업로드"><span>파일 업로드</span></li>' +
        '              <li><img src="/common/images/file/file_del.svg" alt="업로드"><span>파일 삭제</span></li>' +
        '              <li><img src="/common/images/file/download.svg" alt="업로드"><span>파일 다운로드</span></li>' +
        '            </ul>' +
        '          </div>')      // table 안에 있는 caption 활성화

    document.querySelectorAll(".icon li")[0].addEventListener("click",function (e) {
        // 현재 폴더 이름 변경 중일때 변경 완료 처리
        if(document.querySelectorAll(".tree_all .name_change").length > 0){
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
        }

        // 1개 이상 체크가 되어 있을 때
        // 다중 체크 되어 있을 때 맨 위에 있는것이 이름 변경하기 위한 입력창이 생김
        if (document.getElementById("table_id").querySelectorAll("tbody tr td").length > 1) {

            if(document.querySelectorAll("#table_id .name_change").length === 0) {
                let el = document.getElementById("table_id").querySelectorAll("tbody tr")
                for (let i = 0; i < el.length; i++) {
                    if (el[i].classList.contains("backgroundColor_c0dbff")) {
                        preFileName = el[i].querySelectorAll("td")[1].querySelector("label").textContent
                        let fileNameChangeWidth = el[i].querySelectorAll("td")[1].querySelector("label").offsetWidth + 30
                        el[i].querySelectorAll("td")[1].innerHTML = '<input style="width: ' + fileNameChangeWidth + 'px" class="name_change" type="text" value= "' + el[i].querySelectorAll("td")[1].querySelector("label").textContent + '">'
                        el[i].querySelectorAll("td")[1].querySelector(".name_change").focus()
                        break
                    }
                }
            }
        }
    })

    // 파일 업로드
    document.querySelectorAll('.icon li')[1].addEventListener('click', function () {
        fileUpload()
    });

    // 파일 삭제
    document.querySelectorAll('.icon li')[2].addEventListener('click', function () {
        let el = document.querySelectorAll("input[name='check']:checked")   // 체크된거 확인
        //  파일 선택여부 체크
        if (el.length === 0) {
            document.getElementsByClassName("warning_txt")[0].textContent = '삭제할 파일이 선택되지 않았습니다.'
            document.getElementsByClassName("warning_modal_bg")[0].style.display = 'inline'
        } else {
            document.getElementsByClassName("delete_txt")[0].innerHTML = '선택한 파일을 <br> 정말 삭제하시겠습니까?'
            document.getElementsByClassName("delete_modal_bg")[0].style.display = 'inline'
        }
    });
    document.querySelector('.n_delete_modal button').addEventListener('click', function () {
        document.getElementsByClassName('n_delete_modal')[0].style.display = 'none'
        document.getElementsByClassName('delete_modal_bg')[0].style.display = 'none'

    })
    document.querySelector('.n_delete_modal img').addEventListener('click', function () {
        document.getElementsByClassName('n_delete_modal')[0].style.display = 'none'
        document.getElementsByClassName('delete_modal_bg')[0].style.display = 'none'
    })

    // 파일 다운
    document.querySelectorAll('.icon li')[3].addEventListener('click', function () {

        let el = document.querySelectorAll("input[name='check']:checked")   // 체크된거 확인

        if (el.length === 0) {
            document.getElementsByClassName("warning_txt")[0].textContent = '다운로드할 파일이 선택되지 않았습니다.'
            document.getElementsByClassName("warning_modal_bg")[0].style.display = 'inline'
        } else {
            document.getElementsByClassName("download_modal_bg")[0].style.display = 'inline'

            let t = ""
            for (let i = 0; i < el.length; i++) {
                t += '<li>' + el[i].value + '</li>'
            }
            document.getElementsByClassName("download_file")[0].innerHTML = t
        }
    });


}

function folderDel() {
    //  부모노드
    let dirPath = document.querySelector(".main_left input").value
    if (dirPath === "/") {
        document.getElementsByClassName('n_delete_modal')[0].style.display = 'inline'
    } else {
        $.ajax({
            type: "get",
            url: "/file/deleteDir",
            data: {
                "dirPath": dirPath,
            },
            success: function (data) {
                if (data === "완료") {
                    document.getElementsByClassName("delete_modal_bg")[0].style.display = 'none'
                    document.getElementsByClassName(dirPath)[0].parentNode.remove()
                    document.getElementsByClassName("complete_txt")[0].textContent = '폴더 삭제를 완료하였습니다'
                    document.getElementsByClassName("complete_modal_bg")[0].style.display = 'none'

                    let text = document.querySelector('.main_left input').value.split("/")
                    let result = "/"
                    for (let i = 1; i < text.length - 1; i++) {
                        if (i !== 1) {
                            result += "/"
                        }
                        result += text[i]
                    }
                    document.getElementsByClassName(result)[0].getElementsByTagName("span")[0].classList.add("backgroundColor_c0dbff")
                    document.querySelector('.main_left input').value = result
                    showChildFileList(result)
                } else if (data === "폴더 안에 폴더 또는 파일을 먼저 삭제해주세요") {
                    document.querySelector('.n_delete_modal .n_delete_txt').textContent = dirPath + '에 있는 폴더, 파일을 먼저 삭제해주세요'
                    document.querySelector('.n_delete_modal').style.display = 'inline'
                } else {
                    document.querySelector('.n_delete_modal .n_delete_txt').textContent = "'" + dirPath + "' 폴더 삭제 중, 오류가 발생하였습니다."
                    document.querySelector('.n_delete_modal').style.display = 'inline'
                }
            },
            error: function (error) {
                document.querySelector('.n_delete_modal .n_delete_txt').textContent = "'" + dirPath + "' 폴더 삭제 중, 오류가 발생하였습니다."
                document.querySelector('.n_delete_modal').style.display = 'inline'
            }
        });


    }
}

function fileDel() {
    let el = document.querySelectorAll("input[name='check']:checked")
    //  부모노드
    let parentDirPath = document.querySelector(".main_left input").value
    let fileNameList = []
    for (let i = 0; i < el.length; i++) {
        fileNameList.push(el[i].value)
    }

    // 파일 삭제 요청
    $.ajax({
        type: "post",
        url: "/file/deleteFile",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8;",
        data: {
            "parentDirPath": parentDirPath,
            "fileNameList": fileNameList,
        },
        success: function (data) {

            let parsedData = JSON.parse(data);

            if (parsedData) {
                document.getElementsByClassName("complete_txt")[0].textContent = '파일 삭제를 완료하였습니다'
                document.getElementsByClassName("complete_modal_bg")[0].style.display = 'inline'
                document.getElementsByClassName("delete_modal_bg")[0].style.display = 'none'
                showChildFileList(parentDirPath);

            } else {
                document.querySelector('.n_delete_modal .n_delete_txt').textContent = "파일 삭제를 실패하였습니다."
                document.querySelector('.n_delete_modal').style.display = 'inline'
            }
        },
        error: function (error) {
            document.querySelector('.n_delete_modal .n_delete_txt').textContent = "파일 삭제를 실패하였습니다."
            document.querySelector('.n_delete_modal').style.display = 'inline'
        }
    });



}

function fileDownload() {
    let el = document.querySelectorAll("input[name='check']:checked")   // 체크된거 확인

    let parentDirPath = document.querySelector(".main_left input").value
    let fileNameList = []
    for (let i = 0; i < el.length; i++) {
        fileNameList.push(el[i].value)
    }

    $.fileDownload("/file/downloadFile", {
        httpMethod: 'post',
        data: {
            parentDirPath: parentDirPath,
            fileNameList: fileNameList
        },
        successCallback: function (data) {
            document.querySelector(".download_modal_bg").style.display = 'none'
            document.getElementsByClassName("complete_txt")[0].textContent = '파일 다운로드를 완료하였습니다'
            document.getElementsByClassName("complete_modal_bg")[0].style.display = 'inline'
        },
        failCallback: function (err) {
            console.log(err)
        },
    })
}

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
        document.getElementsByClassName('upload_file_all')[0].innerHTML = '<ul class="upload_file_list"></ul>'
        if (document.querySelector(".upload_file") !== null) {
            document.querySelector(".upload_file").remove()
        }
        let parentDirPath = document.querySelector(".main_left input").value
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