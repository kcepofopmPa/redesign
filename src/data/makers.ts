// Точные корейские имена производителей для Encar API.
// НЕ МЕНЯТЬ значения: API чувствителен к точному написанию.
// Источник: legacy/index.html (проверено на живом API).

export const MAKERS_KR: Record<string, string> = {
  hyundai:'현대', kia:'기아', genesis:'제네시스', ssangyong:'쌍용', renault:'르노삼성',
  bmw:'BMW', mercedes:'벤츠', audi:'아우디', volkswagen:'폭스바겐', porsche:'포르쉐', mini:'미니', maybach:'마이바흐',
  lexus:'렉서스', toyota:'도요타', honda:'혼다', nissan:'닛산', mazda:'마쯔다', subaru:'스바루', infiniti:'인피니티', acura:'어큐라',
  volvo:'볼보',
  landrover:'랜드로버', jaguar:'재규어', bentley:'벤틀리', rollsroyce:'롤스로이스', aston:'애스턴마틴', mclaren:'맥라렌',
  jeep:'지프', chevrolet:'쉐보레', ford:'포드', cadillac:'캐딜락', lincoln:'링컨', dodge:'닷지', buick:'뷰익', gmc:'GMC', tesla:'테슬라',
  ferrari:'페라리', lamborghini:'람보르기니', maserati:'마세라티', alfa:'알파 로메오',
  peugeot:'푸조', citroen:'시트로엥',
};

export type MakerKey = keyof typeof MAKERS_KR;
