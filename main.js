// Three.js에서 필요한 모듈들을 importmap에 정의된 'three' 경로를 통해 가져옵니다.
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    SphereGeometry,
    CylinderGeometry,
    MeshStandardMaterial,
    Mesh,
    AmbientLight,
    DirectionalLight,
    Color,
    Group,
    Vector3
} from 'three';

// OrbitControls를 addons 경로에서 가져옵니다.
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. 기본 설정
let scene, camera, renderer, controls, directionalLight;
let waterMolecule;

function init() {
    // 장면 (Scene) 설정
    scene = new Scene();
    
    // 배경색을 어두운 남색으로 설정 (물을 연상시키는 색)
    scene.background = new Color(0x1a1a2e);

    // 컨테이너 요소 가져오기
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 원근 카메라 (PerspectiveCamera) 설정
    camera = new PerspectiveCamera(75, width / height, 0.1, 1000);

    // WebGL 렌더러 설정
    renderer = new WebGLRenderer({ antialias: true });
    
    // 화면 크기에 맞게 렌더러 크기 설정
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 컨테이너에 렌더러의 DOM 요소를 추가 (Three.js 캔버스)
    container.appendChild(renderer.domElement);

    // 2. 조명 추가
    
    // 주변광 (AmbientLight) - 전체적인 기본 밝기 제공
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // 방향성 조명 (DirectionalLight)
    directionalLight = new DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // 추가 방향성 조명 (반대편에서)
    const directionalLight2 = new DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // 3. 물분자 구조 생성
    createWaterMolecule();

    // 4. 카메라 위치 조정
    camera.position.set(5, 3, 7);
    camera.lookAt(0, 0, 0);

    // 5. OrbitControls 설정
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 15;

    // 6. 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', onWindowResize, false);
}

// 물분자 구조 생성 함수
function createWaterMolecule() {
    // 물분자 전체를 담을 그룹 생성
    waterMolecule = new Group();
    scene.add(waterMolecule);
    
    // 산소 원자 (O) - 빨간색, 큰 구
    const oxygenGeometry = new SphereGeometry(0.6, 32, 32);
    const oxygenMaterial = new MeshStandardMaterial({ 
        color: 0xff0000,
        roughness: 0.3,
        metalness: 0.2
    });
    const oxygen = new Mesh(oxygenGeometry, oxygenMaterial);
    oxygen.position.set(0, 0, 0);
    waterMolecule.add(oxygen);
    
    // 수소 원자 (H) - 흰색, 작은 구
    const hydrogenGeometry = new SphereGeometry(0.35, 32, 32);
    const hydrogenMaterial = new MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.2
    });
    
    // 물분자의 결합각은 약 104.5도
    // 수소-산소 결합 길이 비율
    const bondLength = 1.8;
    const bondAngle = 104.5 * Math.PI / 180; // 라디안으로 변환
    
    // 첫 번째 수소 원자 (H1)
    const hydrogen1 = new Mesh(hydrogenGeometry, hydrogenMaterial);
    const h1Angle = bondAngle / 2;
    hydrogen1.position.set(
        bondLength * Math.sin(h1Angle),
        bondLength * Math.cos(h1Angle),
        0
    );
    waterMolecule.add(hydrogen1);
    
    // 두 번째 수소 원자 (H2)
    const hydrogen2 = new Mesh(hydrogenGeometry, hydrogenMaterial);
    const h2Angle = -bondAngle / 2;
    hydrogen2.position.set(
        bondLength * Math.sin(h2Angle),
        bondLength * Math.cos(h2Angle),
        0
    );
    waterMolecule.add(hydrogen2);
    
    // 결합선 (Bond) 생성 - 회색 원기둥
    const bondMaterial = new MeshStandardMaterial({ 
        color: 0x888888,
        roughness: 0.5,
        metalness: 0.3
    });
    
    // O-H1 결합선
    createBond(
        new Vector3(0, 0, 0),
        hydrogen1.position,
        bondMaterial,
        waterMolecule
    );
    
    // O-H2 결합선
    createBond(
        new Vector3(0, 0, 0),
        hydrogen2.position,
        bondMaterial,
        waterMolecule
    );
}

// 두 점 사이에 결합선(원기둥)을 생성하는 함수
function createBond(start, end, material, parent) {
    const direction = new Vector3().subVectors(end, start);
    const length = direction.length();
    const bondRadius = 0.1;
    
    // 원기둥 생성
    const bondGeometry = new CylinderGeometry(bondRadius, bondRadius, length, 8);
    const bond = new Mesh(bondGeometry, material);
    
    // 원기둥의 중심을 두 점의 중간으로 이동
    bond.position.copy(start).add(direction.multiplyScalar(0.5));
    
    // 원기둥을 두 점을 연결하는 방향으로 회전
    const axis = new Vector3(0, 1, 0);
    bond.quaternion.setFromUnitVectors(axis, direction.clone().normalize());
    
    parent.add(bond);
}

// 창 크기 변경 시 호출되는 함수
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // 카메라의 종횡비(aspect)를 새 창 크기에 맞게 업데이트
    camera.aspect = width / height;
    camera.updateProjectionMatrix(); // 변경된 카메라 속성을 적용
    
    // 렌더러 크기를 새 창 크기에 맞게 업데이트
    renderer.setSize(width, height);
}

// 애니메이션 루프 구현
function animate() {
    // 브라우저의 다음 프레임에서 animate 함수를 다시 호출하도록 예약
    requestAnimationFrame(animate);

    // OrbitControls 업데이트 (enableDamping이 true일 때 필요)
    controls.update();
    
    // 방향성 조명이 카메라를 따라다니도록 설정
    directionalLight.position.copy(camera.position);
    
    // 물분자를 천천히 회전시켜 모든 각도에서 관찰 가능하도록
    waterMolecule.rotation.y += 0.005;

    // 장면을 카메라를 통해 렌더링
    renderer.render(scene, camera);
}

// 애플리케이션 시작
init();
animate();