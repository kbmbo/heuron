document.addEventListener("DOMContentLoaded", () => {
    
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState < 4) {
            document.body.classList.add('loading');
        } else {
            document.body.classList.remove('loading');
            if (xhttp.readyState == 4 && xhttp.status !== 200){
                alert(`데이터 로드 실패 ${xhttp.status}`);
            } else if (xhttp.readyState == 4 && xhttp.status == 200){
                let photoJson = xhttp.response
                galleryLoad(photoJson);
                
            }
        }
    }
    xhttp.open("GET","https://picsum.photos/v2/list",true);
    xhttp.send();
    xhttp.responseType = 'json';
    
    const thumbNail = obj => 
        `<figure class="imgContainer animated" data-filter="${obj.author}">
            <div class="thumb">
                <img class="img" src="${obj.download_url}"/>
                <div class="bgImg bg-img" style="background-image:url(${obj.download_url})"></div>
                <div class="thumb_btn" draggable="true"><button class="imgDel">삭제</button></div>
                <p class="loading"></p>
            </div>
            <figcaption>
                <p>${obj.author}</p>
            </figcaption>
        </figure>`;

    const filterList = optionValue => `<option value="${optionValue}">${optionValue}</option>`;

    const galleryCon = document.getElementById('galleryList');
    const filterCon = document.getElementById('filterCon');
    
    let galleryJson;
    let authorValue; 
    const galleryLoad = photoJson => {
        //galleryJson = [{"id":"0","author":"kspring","width":5616,"height":3744,"url":"https://unsplash.com/photos/yC-Yzbqy7PY","download_url":"https://icsum.photos/id/10/2500/1667"},{"id":"1025","author":"Matthew Wiebe","width":4951,"height":3301,"url":"https://unsplash.com/photos/U5rMrSI7Pn4","download_url":"https://picsum.photos/id/1024/1920/1280"}];
        galleryJson = photoJson;
        galleryCon.innerHTML='';
        authorValue = [];
        
        galleryJson.forEach( obj => {
            authorValue.push(obj.author)
            galleryCon.insertAdjacentHTML('beforeend', thumbNail(obj));
            const imgContainer = galleryCon.querySelectorAll(".imgContainer");
            Array.from(imgContainer).forEach( (el,idx) => {

                const imgTag = el.querySelector('.img');
                const bgImg = el.querySelector('.bgImg');
                const loading = el.querySelector('.loading');
                let thumb = el.querySelector('.thumb');
                let thumbW = thumb.offsetWidth/2;

                async function loadImage(elem) {
                    return new Promise((resolve, reject) => {
                        elem.onload = () => resolve(loading.style.display = "none", bgImg.style.display = "block"); //이미지 로드 성공
                        elem.onerror = () => reject(bgImg.className="no-img", loading.style.display = "none"); //이미지 로드 에러
                    });                  
                }
                
                const funcAsync = async () => {
                    await loadImage(imgTag);
                };
                funcAsync().then(() => {

                    slideBtn(thumb,thumbW,idx);

                    window.addEventListener('resize', () => { // resize시 삭제 버튼 이벤트 위치 사이즈 반영 
                        thumb = el.querySelector('.thumb');
                        thumbW = thumb.offsetWidth/2;
                        slideBtn(thumb,thumbW,idx);
                    });
                });
            })
            
        });
        
        const authorList = [...new Set(authorValue)].sort(function(a, b) { //문자열 오름차순
            const upperCaseA = a.toUpperCase();
            const upperCaseB = b.toUpperCase();
            
            if (upperCaseA > upperCaseB) return 1;
            if (upperCaseA < upperCaseB) return -1;
            if (upperCaseA === upperCaseB) return 0;
        });
          
        authorList.map( item => filterCon.insertAdjacentHTML('beforeend', filterList(item)));
        
    }
    
    
    const addPhoto = document.getElementById('addPhoto');
    const inputPop = document.querySelector('.inputPop');
    const imgUrl = document.getElementById('imgUrl');
    const addBtn = inputPop.querySelector('.addBtn');
    const cancel = inputPop.querySelector('.cancel');
    
    addPhoto.addEventListener('click', () => {
        if(inputPop.classList.contains('none')){
            inputPop.classList.add('fade');
            inputPop.classList.remove('none');
            imgUrl.focus();
        } 
    });

    inputPop.addEventListener('click', e => { //사진추가 팝업 닫기
        if (e.target === inputPop || e.target === cancel ){
            imgUrl.value = null;
            inputPop.classList.add('none');
        }
    });

    addBtn.addEventListener('click', () => { //이미지 업로드 버튼
        let noSpace = imgUrl.value.replace(/(\s*)/g, ""); //입력된 값에서 스패이스 지우기
        if (noSpace === ''){ //공백 일때
            alert('URL을 입력하세요');
        } else {
            galleryJson.unshift({ author: "test", download_url: noSpace }); // 입력한 url 반영
            galleryLoad(galleryJson); //추가된 데이터로 갤러디 다시 로드
            inputPop.classList.add('none'); //url입력 창 닫기
            imgUrl.value = null; //인풋 비우기
        }
    });

    filterCon.addEventListener('change', (e) => { //셀렉트 박스 채인지 이벤트 author 필터 

        const selectChange = galleryCon.querySelectorAll(".imgContainer");
        const active = e.target.value;

        console.log(`Your selection ${e.target.value}`);
        
        Array.from(selectChange).forEach( el => {
            
            if (active === 'All'){
                el.classList.add('zoomIn');
                el.classList.remove('fadeOutDown','none');
            } else {
                el.classList.add('fadeOutDown'); //전체 페이드 다운
                setTimeout(function(){ //0.5초후 실헹
                    el.classList.add('none'); //전체 디스플레이 숨김
                    if(el.dataset.filter === active){ // 선택된 사진 디스플레이
                        el.classList.add('zoomIn'); //줌인
                        el.classList.remove('fadeOutDown','none'); //위에 숨김처리했던 css삭제
                    } 
                },500);
            }
        });
    });

    const slideBtn = (thumb,thumbW,idx) => {
        let startX;
        let dragging;

        document.addEventListener('mousedown', e => { 
            if (e.target === thumb.querySelector('.imgDel')){ //해당 썸네일 영역이거나 삭제버튼이면 실행
                galleryJson.splice(idx, 1); // 해당 데이터 삭제
                galleryLoad(galleryJson);   // 갤러리 로드
                
            } else {
                thumb.querySelector('.thumb_btn').style.left = "100%"; // 삭제 박스 나와 있는 상태에서 삭제 버튼 외 영역 눌렸을때 닫기 
            }
            
        })
        
        thumb.addEventListener('mousedown', e => {
            e.preventDefault();

            if (thumbW < e.offsetX){ //썸네일 중앙 기준 오른쪽 영역에서 스타트 일때 버튼 나올 준비
                dragging =  true;
                e.currentTarget.querySelector('.thumb_btn').style.left = `${e.offsetX-10}px`;
            }
            return startX = e.offsetX
        });

        thumb.addEventListener('mousemove', e => {
            e.preventDefault();

            if (dragging && e.offsetX < startX){ //드래그 시작 true, 오른쪽에서 왼쪽일때 무브 시작
                e.currentTarget.querySelector('.thumb_btn').style.left = `${e.offsetX-10}px`;
            }
        });
        
        thumb.addEventListener('mouseup', e => {
            let move = startX - e.offsetX
            dragging =  false;
            e.preventDefault();
            console.log(e.offsetX , startX)
            if (thumbW < startX && e.offsetX < startX){ // 썸네일 중앙 오른쪽에서 스타트 일때 드래그 오른쪽에서 왼쪽일때
                if ( move > 30 ){  // 마우스 이동이 시작과 끝이 30 이상일때
                    e.currentTarget.querySelector('.thumb_btn').style.left = "0";
                } else if( move <= 30 ){// 드래그 이동이 적었을때 원위치
                    e.currentTarget.querySelector('.thumb_btn').style.left = "100%";
                }
            }

        });
        
    }    
    
});
