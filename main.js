// Three.js에서 필요한 모듈들을 importmap에 정의된 'three' 경로를 통해 가져옵니다.
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh
} from 'three';

// 1. 기본 설정
let scene, camera, renderer, cube;

function init() {
    // 장면 (Scene) 설정
    scene = new Scene();

    // 원근 카메라 (PerspectiveCamera) 설정
    // 시야각(FOV): 75도, 종횡비(Aspect): 창 크기 비율, near/far clipping plane
    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // WebGL 렌더러 설정
    renderer = new WebGLRenderer({ antialias: true });
    
    // 화면 크기에 맞게 렌더러 크기 설정
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // HTML body에 렌더러의 DOM 요소를 추가 (Three.js 캔버스)
    document.body.appendChild(renderer.domElement);

    // 2. 큐브 생성 및 장면에 추가
    
    // 정육면체 지오메트리 (가로, 세로, 깊이: 1x1x1)
    const geometry = new BoxGeometry(1, 1, 1);
    
    // 초록색 (0x00ff00) 기본 재질 생성
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    
    // 지오메트리와 재질을 결합하여 메쉬(큐브) 생성
    cube = new Mesh(geometry, material);
    
    // 큐브를 장면에 추가
    scene.add(cube);

    // 3. 카메라 위치 조정
    // 큐브를 볼 수 있도록 카메라를 Z축으로 5만큼 이동
    camera.position.z = 5;

    // 4. 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', onWindowResize, false);
}

// 창 크기 변경 시 호출되는 함수
function onWindowResize() {
    // 카메라의 종횡비(aspect)를 새 창 크기에 맞게 업데이트
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // 변경된 카메라 속성을 적용
    
    // 렌더러 크기를 새 창 크기에 맞게 업데이트
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 5. 애니메이션 루프 구현
function animate() {
    // 브라우저의 다음 프레임에서 animate 함수를 다시 호출하도록 예약
    requestAnimationFrame(animate);

    // 큐브 회전 로직 (x축과 y축으로 0.01씩 회전)
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // 장면을 카메라를 통해 렌더링
    renderer.render(scene, camera);
}

// 애플리케이션 시작
init();
animate();
