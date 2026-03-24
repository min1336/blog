// ========================================
// 데코레이터 구현 연습
// ========================================

// --- 1단계: 클래스 데코레이터 ---
// 클래스에 붙여서 "이 클래스가 생성되었다"는 로그를 남기는 데코레이터
//
// 구조: function 데코레이터이름(target: Function) { ... }
// target = 데코레이터가 붙은 클래스 자체

function LogClass(target: Function) {
  console.log(`[LogClass] ${target.name} 클래스가 등록되었습니다`);
}

@LogClass
class ExampleService {
  hello() {
    return 'hello';
  }
}
// 실행 결과: "[LogClass] ExampleService 클래스가 등록되었습니다"

// --- 2단계: 팩토리 데코레이터 (인자를 받는 데코레이터) ---
// @Controller('posts')처럼 인자를 받으려면 "함수를 리턴하는 함수"로 만든다
//
// 구조: function 이름(인자) { return function(target) { ... } }

function LogClassWithPrefix(prefix: string) {
  return function (target: Function) {
    console.log(`[${prefix}] ${target.name} 클래스가 등록되었습니다`);
  };
}

@LogClassWithPrefix('MyApp')
class AnotherService {
  greet() {
    return 'hi';
  }
}
// 실행 결과: "[MyApp] AnotherService 클래스가 등록되었습니다"

// --- 3단계: 메서드 데코레이터 ---
// TODO(human): 메서드 실행 시간을 측정하는 @LogExecutionTime 데코레이터를 구현하세요
//
// 힌트:
//   - target: 클래스의 prototype 객체
//   - propertyKey: 메서드 이름 (string)
//   - descriptor: PropertyDescriptor (메서드의 설정 객체)
//   - descriptor.value가 원래 메서드 함수입니다
//   - 원래 메서드를 새 함수로 감싸서 descriptor.value에 다시 할당하면 됩니다
//
function LogExecutionTime(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  // 여기에 구현하세요
}

class PostService {
  @LogExecutionTime
  findAll() {
    // 무거운 작업 시뮬레이션
    const arr = Array.from({ length: 1000000 }, (_, i) => i);
    return arr.filter((n) => n % 2 === 0);
  }
}

// 테스트
const service = new PostService();
service.findAll();
// 기대 결과: "[LogExecutionTime] findAll 실행 시간: 12.34ms" (숫자는 달라질 수 있음)
