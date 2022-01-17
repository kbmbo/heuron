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
            Array.from(imgContainer).forEach( el => {
                const thumb = el.querySelector('.thumb');
                const imgTag = el.querySelector('.img');
                const bgImg = el.querySelector('.bgImg');
                const thumbW = thumb.offsetWidth/2;
                const loading = el.querySelector('.loading');

                async function loadImage(elem) {
                    return new Promise((resolve, reject) => {
                        elem.onload = () => {
                            resolve();
                            loading.style.display = "none";
                            bgImg.style.display = "block";
                        }
                        elem.onerror = () => {
                            bgImg.className="no-img"
                            loading.style.display = "none";
                            reject();
                        }
                    });                  
                }
                
                const funcAsync = async () => {
                    await loadImage(imgTag);
                };
                funcAsync().then(result => {
                    slideBtn(thumb,thumbW);
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

    inputPop.addEventListener('click', e => {
        if (e.target === inputPop || e.target === cancel ){
            imgUrl.value = null;
            inputPop.classList.add('none');
        }
    });

    addBtn.addEventListener('click', () => {
        let noSpace = imgUrl.value.replace(/(\s*)/g, "");
        if (noSpace === ''){
            alert('URL을 입력하세요');
        } else {
            galleryJson.unshift({ author: "test", download_url: noSpace });
            galleryLoad(galleryJson);
            inputPop.classList.add('none');
            imgUrl.value = null;
        }
    });
    
    galleryCon.addEventListener('mouseenter', () => {
        
        const imgDel = galleryCon.querySelectorAll('.imgDel');
        
        Array.from(imgDel).forEach( (el,idx) => el.addEventListener('click', () => {
                galleryJson.splice(idx, 1);
                galleryLoad(galleryJson);
            })
        )
        
    });

    filterCon.addEventListener('change', (e) => {

        const selectChange = galleryCon.querySelectorAll(".imgContainer");
        let active = e.target.value;

        console.log(`Your selection ${e.target.value}`);
        
        Array.from(selectChange).forEach( el => {
            
            if (active === 'All'){
                el.classList.add('zoomIn');
                el.classList.remove('fadeOutDown','none');
            } else {
                el.classList.add('fadeOutDown');
                setTimeout(function(){
                    el.classList.add('none');
                    if(el.dataset.filter === active){
                        el.classList.add('zoomIn');
                        el.classList.remove('fadeOutDown','none');
                    } 
                },500);
            }
        });
    });

    const slideBtn = (thumb,thumbW) => {
        let startX;

        document.addEventListener('mousedown', (e) => {
            if(e.target === thumb.querySelector('.thumb') || e.target === thumb.querySelector('.imgDel')){
                return
            } else {
                thumb.querySelector('.thumb_btn').style.left = "100%";
            }
            
        })
        
        thumb.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (thumbW < e.offsetX){ //썸네일 중앙 오른쪽에서 스타트 일때 버튼 나올 준비
                e.currentTarget.querySelector('.thumb_btn').style.left = `${e.offsetX}px`;
            }
            return startX = e.offsetX
        });
        
        thumb.addEventListener('mouseup', (e) => {
            e.preventDefault();
            if ( thumbW < startX && startX > (e.offsetX+25) ){ // 썸네일 중앙 오른쪽에서 스타트 이면서 좌에서 우로 마우스 이동 후 
                e.currentTarget.querySelector('.thumb_btn').style.left = "0";
            } else if( startX < e.offsetX || startX <= (e.offsetX+25) ){// 우에서 좌로 마우스 이동 후 또는 스타트 이후 그래그 이동이 적었을때 원위치
                e.currentTarget.querySelector('.thumb_btn').style.left = "100%";
            }

        });
        
    }    
    
});
