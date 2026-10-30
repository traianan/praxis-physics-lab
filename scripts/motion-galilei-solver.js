  MR.solveGalilei = (unknown, p) => {
    const fail = (reason) => ({ ok: false, reason, solutions: [] });
    const solution = (value, t) => ({ ok: true, solutions: [{ value, t }] });
    const eps = 1e-9, future = t => Number.isFinite(t) && t >= -eps;
    const impossible = 'Datele nu descriu o mișcare cu durată nenegativă. Verifică semnele și deplasarea.';
    if (Object.entries(p).some(([key,value])=>key!==unknown&&!Number.isFinite(value))) return fail('Introdu valori numerice finite.');
    const {v0,v,a,dx}=p;
    if(unknown==='v'){
      if(a===0){if(v0===0)return dx===0?solution(0,0):fail(impossible);const t=dx/v0;return future(t)?solution(v0,Math.max(0,t)):fail(impossible);}
      const times=MR.roots(a/2,v0,-dx).filter(future).map(t=>Math.max(0,t));
      return times.length?{ok:true,solutions:times.map(t=>({value:v0+a*t,t}))}:fail(impossible);
    }
    if(unknown==='v0'){
      if(a===0){if(v===0)return dx===0?solution(0,0):fail(impossible);const t=dx/v;return future(t)?solution(v,Math.max(0,t)):fail(impossible);}
      const rad=v*v-2*a*dx,tol=Number.EPSILON*16*(v*v+Math.abs(2*a*dx)+1);if(rad < -tol)return fail(impossible);
      const speed=Math.sqrt(Math.max(0,rad)),candidates=speed?[speed,-speed]:[0];
      const solutions=candidates.map(value=>({value,t:(v-value)/a})).filter(s=>future(s.t)).map(s=>({...s,t:Math.max(0,s.t)}));
      return solutions.length?{ok:true,solutions}:fail(impossible);
    }
    if(unknown==='a'){
      if(dx===0)return fail(Math.abs(v*v-v0*v0)<eps?'Accelerația nu se poate determina unic din aceste date.':impossible);
      const acceleration=(v*v-v0*v0)/(2*dx);
      if(acceleration===0){if(v!==v0||v===0)return fail(impossible);const t=dx/v;return future(t)?solution(0,Math.max(0,t)):fail(impossible);}
      const t=(v-v0)/acceleration;return future(t)?solution(acceleration,Math.max(0,t)):fail(impossible);
    }
    if(a===0)return v===v0&&v===0?solution(0,null):fail(v===v0?'Deplasarea nu se poate determina fără durată.':impossible);
    const t=(v-v0)/a;return future(t)?solution((v*v-v0*v0)/(2*a),Math.max(0,t)):fail(impossible);
  };
