(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const u of document.querySelectorAll('link[rel="modulepreload"]'))r(u);new MutationObserver(u=>{for(const f of u)if(f.type==="childList")for(const h of f.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&r(h)}).observe(document,{childList:!0,subtree:!0});function i(u){const f={};return u.integrity&&(f.integrity=u.integrity),u.referrerPolicy&&(f.referrerPolicy=u.referrerPolicy),u.crossOrigin==="use-credentials"?f.credentials="include":u.crossOrigin==="anonymous"?f.credentials="omit":f.credentials="same-origin",f}function r(u){if(u.ep)return;u.ep=!0;const f=i(u);fetch(u.href,f)}})();var nd={exports:{}},nl={};var J0;function bM(){if(J0)return nl;J0=1;var o=Symbol.for("react.transitional.element"),e=Symbol.for("react.fragment");function i(r,u,f){var h=null;if(f!==void 0&&(h=""+f),u.key!==void 0&&(h=""+u.key),"key"in u){f={};for(var d in u)d!=="key"&&(f[d]=u[d])}else f=u;return u=f.ref,{$$typeof:o,type:r,key:h,ref:u!==void 0?u:null,props:f}}return nl.Fragment=e,nl.jsx=i,nl.jsxs=i,nl}var $0;function AM(){return $0||($0=1,nd.exports=bM()),nd.exports}var on=AM(),id={exports:{}},oe={};var tv;function RM(){if(tv)return oe;tv=1;var o=Symbol.for("react.transitional.element"),e=Symbol.for("react.portal"),i=Symbol.for("react.fragment"),r=Symbol.for("react.strict_mode"),u=Symbol.for("react.profiler"),f=Symbol.for("react.consumer"),h=Symbol.for("react.context"),d=Symbol.for("react.forward_ref"),g=Symbol.for("react.suspense"),_=Symbol.for("react.memo"),S=Symbol.for("react.lazy"),m=Symbol.for("react.activity"),y=Symbol.for("react.view_transition"),M=Symbol.iterator;function A(I){return I===null||typeof I!="object"?null:(I=M&&I[M]||I["@@iterator"],typeof I=="function"?I:null)}var R={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},x=Object.assign,v={};function z(I,ct,J){this.props=I,this.context=ct,this.refs=v,this.updater=J||R}z.prototype.isReactComponent={},z.prototype.setState=function(I,ct){if(typeof I!="object"&&typeof I!="function"&&I!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,I,ct,"setState")},z.prototype.forceUpdate=function(I){this.updater.enqueueForceUpdate(this,I,"forceUpdate")};function P(){}P.prototype=z.prototype;function D(I,ct,J){this.props=I,this.context=ct,this.refs=v,this.updater=J||R}var H=D.prototype=new P;H.constructor=D,x(H,z.prototype),H.isPureReactComponent=!0;var B=Array.isArray;function O(){}var k={H:null,A:null,T:null,S:null},w=Object.prototype.hasOwnProperty;function C(I,ct,J){var it=J.ref;return{$$typeof:o,type:I,key:ct,ref:it!==void 0?it:null,props:J}}function V(I,ct){return C(I.type,ct,I.props)}function at(I){return typeof I=="object"&&I!==null&&I.$$typeof===o}function ut(I){var ct={"=":"=0",":":"=2"};return"$"+I.replace(/[=:]/g,function(J){return ct[J]})}var _t=/\/+/g;function lt(I,ct){return typeof I=="object"&&I!==null&&I.key!=null?ut(""+I.key):ct.toString(36)}function W(I){switch(I.status){case"fulfilled":return I.value;case"rejected":throw I.reason;default:switch(typeof I.status=="string"?I.then(O,O):(I.status="pending",I.then(function(ct){I.status==="pending"&&(I.status="fulfilled",I.value=ct)},function(ct){I.status==="pending"&&(I.status="rejected",I.reason=ct)})),I.status){case"fulfilled":return I.value;case"rejected":throw I.reason}}throw I}function st(I,ct,J,it,xt){var Ut=typeof I;(Ut==="undefined"||Ut==="boolean")&&(I=null);var At=!1;if(I===null)At=!0;else switch(Ut){case"bigint":case"string":case"number":At=!0;break;case"object":switch(I.$$typeof){case o:case e:At=!0;break;case S:return At=I._init,st(At(I._payload),ct,J,it,xt)}}if(At)return xt=xt(I),At=it===""?"."+lt(I,0):it,B(xt)?(J="",At!=null&&(J=At.replace(_t,"$&/")+"/"),st(xt,ct,J,"",function(L){return L})):xt!=null&&(at(xt)&&(xt=V(xt,J+(xt.key==null||I&&I.key===xt.key?"":(""+xt.key).replace(_t,"$&/")+"/")+At)),ct.push(xt)),1;At=0;var Mt=it===""?".":it+":";if(B(I))for(var Yt=0;Yt<I.length;Yt++)it=I[Yt],Ut=Mt+lt(it,Yt),At+=st(it,ct,J,Ut,xt);else if(Yt=A(I),typeof Yt=="function")for(I=Yt.call(I),Yt=0;!(it=I.next()).done;)it=it.value,Ut=Mt+lt(it,Yt++),At+=st(it,ct,J,Ut,xt);else if(Ut==="object"){if(typeof I.then=="function")return st(W(I),ct,J,it,xt);throw ct=String(I),Error("Objects are not valid as a React child (found: "+(ct==="[object Object]"?"object with keys {"+Object.keys(I).join(", ")+"}":ct)+"). If you meant to render a collection of children, use an array instead.")}return At}function Z(I,ct,J){if(I==null)return I;var it=[],xt=0;return st(I,it,"","",function(Ut){return ct.call(J,Ut,xt++)}),it}function gt(I){if(I._status===-1){var ct=I._result,J=ct();J.then(function(it){(I._status===0||I._status===-1)&&(I._status=1,I._result=it,J.status===void 0&&(J.status="fulfilled",J.value=it))},function(it){(I._status===0||I._status===-1)&&(I._status=2,I._result=it,J.status===void 0&&(J.status="rejected",J.reason=it))}),I._status===-1&&(I._status=0,I._result=J)}if(I._status===1)return I._result.default;throw I._result}var St=typeof reportError=="function"?reportError:function(I){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var ct=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof I=="object"&&I!==null&&typeof I.message=="string"?String(I.message):String(I),error:I});if(!window.dispatchEvent(ct))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",I);return}console.error(I)};function Ht(I){var ct=k.T,J={};J.types=ct!==null?ct.types:null,k.T=J;try{var it=I(),xt=k.S;xt!==null&&xt(J,it),typeof it=="object"&&it!==null&&typeof it.then=="function"&&it.then(O,St)}catch(Ut){St(Ut)}finally{ct!==null&&J.types!==null&&(ct.types=J.types),k.T=ct}}function se(I){var ct=k.T;if(ct!==null){var J=ct.types;J===null?ct.types=[I]:J.indexOf(I)===-1&&J.push(I)}else Ht(se.bind(null,I))}var Te={map:Z,forEach:function(I,ct,J){Z(I,function(){ct.apply(this,arguments)},J)},count:function(I){var ct=0;return Z(I,function(){ct++}),ct},toArray:function(I){return Z(I,function(ct){return ct})||[]},only:function(I){if(!at(I))throw Error("React.Children.only expected to receive a single React element child.");return I}};return oe.Activity=m,oe.Children=Te,oe.Component=z,oe.Fragment=i,oe.Profiler=u,oe.PureComponent=D,oe.StrictMode=r,oe.Suspense=g,oe.ViewTransition=y,oe.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=k,oe.__COMPILER_RUNTIME={__proto__:null,c:function(I){return k.H.useMemoCache(I)}},oe.addTransitionType=se,oe.cache=function(I){return function(){return I.apply(null,arguments)}},oe.cacheSignal=function(){return null},oe.cloneElement=function(I,ct,J){if(I==null)throw Error("The argument must be a React element, but you passed "+I+".");var it=x({},I.props),xt=I.key;if(ct!=null)for(Ut in ct.key!==void 0&&(xt=""+ct.key),ct)!w.call(ct,Ut)||Ut==="key"||Ut==="__self"||Ut==="__source"||Ut==="ref"&&ct.ref===void 0||(it[Ut]=ct[Ut]);var Ut=arguments.length-2;if(Ut===1)it.children=J;else if(1<Ut){for(var At=Array(Ut),Mt=0;Mt<Ut;Mt++)At[Mt]=arguments[Mt+2];it.children=At}return C(I.type,xt,it)},oe.createContext=function(I){return I={$$typeof:h,_currentValue:I,_currentValue2:I,_threadCount:0,Provider:null,Consumer:null},I.Provider=I,I.Consumer={$$typeof:f,_context:I},I},oe.createElement=function(I,ct,J){var it,xt={},Ut=null;if(ct!=null)for(it in ct.key!==void 0&&(Ut=""+ct.key),ct)w.call(ct,it)&&it!=="key"&&it!=="__self"&&it!=="__source"&&(xt[it]=ct[it]);var At=arguments.length-2;if(At===1)xt.children=J;else if(1<At){for(var Mt=Array(At),Yt=0;Yt<At;Yt++)Mt[Yt]=arguments[Yt+2];xt.children=Mt}if(I&&I.defaultProps)for(it in At=I.defaultProps,At)xt[it]===void 0&&(xt[it]=At[it]);return C(I,Ut,xt)},oe.createRef=function(){return{current:null}},oe.forwardRef=function(I){return{$$typeof:d,render:I}},oe.isValidElement=at,oe.lazy=function(I){return{$$typeof:S,_payload:{_status:-1,_result:I},_init:gt}},oe.memo=function(I,ct){return{$$typeof:_,type:I,compare:ct===void 0?null:ct}},oe.startTransition=Ht,oe.unstable_useCacheRefresh=function(){return k.H.useCacheRefresh()},oe.use=function(I){return k.H.use(I)},oe.useActionState=function(I,ct,J){return k.H.useActionState(I,ct,J)},oe.useCallback=function(I,ct){return k.H.useCallback(I,ct)},oe.useContext=function(I){return k.H.useContext(I)},oe.useDebugValue=function(){},oe.useDeferredValue=function(I,ct){return k.H.useDeferredValue(I,ct)},oe.useEffect=function(I,ct){return k.H.useEffect(I,ct)},oe.useEffectEvent=function(I){return k.H.useEffectEvent(I)},oe.useId=function(){return k.H.useId()},oe.useImperativeHandle=function(I,ct,J){return k.H.useImperativeHandle(I,ct,J)},oe.useInsertionEffect=function(I,ct){return k.H.useInsertionEffect(I,ct)},oe.useLayoutEffect=function(I,ct){return k.H.useLayoutEffect(I,ct)},oe.useMemo=function(I,ct){return k.H.useMemo(I,ct)},oe.useOptimistic=function(I,ct){return k.H.useOptimistic(I,ct)},oe.useReducer=function(I,ct,J){return k.H.useReducer(I,ct,J)},oe.useRef=function(I){return k.H.useRef(I)},oe.useState=function(I){return k.H.useState(I)},oe.useSyncExternalStore=function(I,ct,J){return k.H.useSyncExternalStore(I,ct,J)},oe.useTransition=function(){return k.H.useTransition()},oe.version="19.3.1",oe}var ev;function Dp(){return ev||(ev=1,id.exports=RM()),id.exports}var xc=Dp(),ad={exports:{}},il={},sd={exports:{}},rd={};var nv;function CM(){return nv||(nv=1,(function(o){function e(W,st){var Z=W.length;W.push(st);t:for(;0<Z;){var gt=Z-1>>>1,St=W[gt];if(0<u(St,st))W[gt]=st,W[Z]=St,Z=gt;else break t}}function i(W){return W.length===0?null:W[0]}function r(W){if(W.length===0)return null;var st=W[0],Z=W.pop();if(Z!==st){W[0]=Z;t:for(var gt=0,St=W.length,Ht=St>>>1;gt<Ht;){var se=2*(gt+1)-1,Te=W[se],I=se+1,ct=W[I];if(0>u(Te,Z))I<St&&0>u(ct,Te)?(W[gt]=ct,W[I]=Z,gt=I):(W[gt]=Te,W[se]=Z,gt=se);else if(I<St&&0>u(ct,Z))W[gt]=ct,W[I]=Z,gt=I;else break t}}return st}function u(W,st){var Z=W.sortIndex-st.sortIndex;return Z!==0?Z:W.id-st.id}if(o.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var f=performance;o.unstable_now=function(){return f.now()}}else{var h=Date,d=h.now();o.unstable_now=function(){return h.now()-d}}var g=[],_=[],S=1,m=null,y=3,M=!1,A=!1,R=!1,x=!1,v=typeof setTimeout=="function"?setTimeout:null,z=typeof clearTimeout=="function"?clearTimeout:null,P=typeof setImmediate<"u"?setImmediate:null;function D(W){for(var st=i(_);st!==null;){if(st.callback===null)r(_);else if(st.startTime<=W)r(_),st.sortIndex=st.expirationTime,e(g,st);else break;st=i(_)}}function H(W){if(R=!1,D(W),!A)if(i(g)!==null)A=!0,B||(B=!0,at());else{var st=i(_);st!==null&&lt(H,st.startTime-W)}}var B=!1,O=-1,k=5,w=-1;function C(){return x?!0:!(o.unstable_now()-w<k)}function V(){if(x=!1,B){var W=o.unstable_now();w=W;var st=!0;try{t:{A=!1,R&&(R=!1,z(O),O=-1),M=!0;var Z=y;try{e:{for(D(W),m=i(g);m!==null&&!(m.expirationTime>W&&C());){var gt=m.callback;if(typeof gt=="function"){m.callback=null,y=m.priorityLevel;var St=gt(m.expirationTime<=W);if(W=o.unstable_now(),typeof St=="function"){m.callback=St,D(W),st=!0;break e}m===i(g)&&r(g),D(W)}else r(g);m=i(g)}if(m!==null)st=!0;else{var Ht=i(_);Ht!==null&&lt(H,Ht.startTime-W),st=!1}}break t}finally{m=null,y=Z,M=!1}st=void 0}}finally{st?at():B=!1}}}var at;if(typeof P=="function")at=function(){P(V)};else if(typeof MessageChannel<"u"){var ut=new MessageChannel,_t=ut.port2;ut.port1.onmessage=V,at=function(){_t.postMessage(null)}}else at=function(){v(V,0)};function lt(W,st){O=v(function(){W(o.unstable_now())},st)}o.unstable_IdlePriority=5,o.unstable_ImmediatePriority=1,o.unstable_LowPriority=4,o.unstable_NormalPriority=3,o.unstable_Profiling=null,o.unstable_UserBlockingPriority=2,o.unstable_cancelCallback=function(W){W.callback=null},o.unstable_forceFrameRate=function(W){0>W||125<W?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):k=0<W?Math.floor(1e3/W):5},o.unstable_getCurrentPriorityLevel=function(){return y},o.unstable_next=function(W){switch(y){case 1:case 2:case 3:var st=3;break;default:st=y}var Z=y;y=st;try{return W()}finally{y=Z}},o.unstable_requestPaint=function(){x=!0},o.unstable_runWithPriority=function(W,st){switch(W){case 1:case 2:case 3:case 4:case 5:break;default:W=3}var Z=y;y=W;try{return st()}finally{y=Z}},o.unstable_scheduleCallback=function(W,st,Z){var gt=o.unstable_now();switch(typeof Z=="object"&&Z!==null?(Z=Z.delay,Z=typeof Z=="number"&&0<Z?gt+Z:gt):Z=gt,W){case 1:var St=-1;break;case 2:St=250;break;case 5:St=1073741823;break;case 4:St=1e4;break;default:St=5e3}return St=Z+St,W={id:S++,callback:st,priorityLevel:W,startTime:Z,expirationTime:St,sortIndex:-1},Z>gt?(W.sortIndex=Z,e(_,W),i(g)===null&&W===i(_)&&(R?(z(O),O=-1):R=!0,lt(H,Z-gt))):(W.sortIndex=St,e(g,W),A||M||(A=!0,B||(B=!0,at()))),W},o.unstable_shouldYield=C,o.unstable_wrapCallback=function(W){var st=y;return function(){var Z=y;y=st;try{return W.apply(this,arguments)}finally{y=Z}}}})(rd)),rd}var iv;function wM(){return iv||(iv=1,sd.exports=CM()),sd.exports}var od={exports:{}},wn={};var av;function DM(){if(av)return wn;av=1;var o=Dp();function e(S){var m="https://react.dev/errors/"+S;if(1<arguments.length){m+="?args[]="+encodeURIComponent(arguments[1]);for(var y=2;y<arguments.length;y++)m+="&args[]="+encodeURIComponent(arguments[y])}return"Minified React error #"+S+"; visit "+m+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function i(){}var r={d:{f:i,r:function(){throw Error(e(522))},D:i,C:i,L:i,m:i,X:i,S:i,M:i},p:0,findDOMNode:null},u=Symbol.for("react.portal"),f=Symbol.for("react.recoverable"),h=Symbol.for("react.optimistic_key");function d(S,m,y){var M=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:u,key:M==null?null:M===h?h:""+M,children:S,containerInfo:m,implementation:y}}var g=o.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function _(S,m){if(S==="font")return"";if(typeof m=="string")return m==="use-credentials"?m:""}return wn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=r,wn.browser=function(S){return{$$typeof:f,_reason:S}},wn.createPortal=function(S,m){var y=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!m||m.nodeType!==1&&m.nodeType!==9&&m.nodeType!==11)throw Error(e(299));return d(S,m,null,y)},wn.flushSync=function(S){var m=g.T,y=r.p;try{if(g.T=null,r.p=2,S)return S()}finally{g.T=m,r.p=y,r.d.f()}},wn.preconnect=function(S,m){typeof S=="string"&&(m?(m=m.crossOrigin,m=typeof m=="string"?m==="use-credentials"?m:"":void 0):m=null,r.d.C(S,m))},wn.prefetchDNS=function(S){typeof S=="string"&&r.d.D(S)},wn.preinit=function(S,m){if(typeof S=="string"&&m&&typeof m.as=="string"){var y=m.as,M=_(y,m.crossOrigin),A=typeof m.integrity=="string"?m.integrity:void 0,R=typeof m.fetchPriority=="string"?m.fetchPriority:void 0;y==="style"?r.d.S(S,typeof m.precedence=="string"?m.precedence:void 0,{crossOrigin:M,integrity:A,fetchPriority:R}):y==="script"&&r.d.X(S,{crossOrigin:M,integrity:A,fetchPriority:R,nonce:typeof m.nonce=="string"?m.nonce:void 0})}},wn.preinitModule=function(S,m){if(typeof S=="string")if(typeof m=="object"&&m!==null){if(m.as==null||m.as==="script"){var y=_(m.as,m.crossOrigin);r.d.M(S,{crossOrigin:y,integrity:typeof m.integrity=="string"?m.integrity:void 0,nonce:typeof m.nonce=="string"?m.nonce:void 0,fetchPriority:typeof m.fetchPriority=="string"?m.fetchPriority:void 0})}}else m==null&&r.d.M(S)},wn.preload=function(S,m){if(typeof S=="string"&&typeof m=="object"&&m!==null&&typeof m.as=="string"){var y=m.as,M=_(y,m.crossOrigin);r.d.L(S,y,{crossOrigin:M,integrity:typeof m.integrity=="string"?m.integrity:void 0,nonce:typeof m.nonce=="string"?m.nonce:void 0,type:typeof m.type=="string"?m.type:void 0,fetchPriority:typeof m.fetchPriority=="string"?m.fetchPriority:void 0,referrerPolicy:typeof m.referrerPolicy=="string"?m.referrerPolicy:void 0,imageSrcSet:typeof m.imageSrcSet=="string"?m.imageSrcSet:void 0,imageSizes:typeof m.imageSizes=="string"?m.imageSizes:void 0,media:typeof m.media=="string"?m.media:void 0})}},wn.preloadModule=function(S,m){if(typeof S=="string")if(m){var y=_(m.as,m.crossOrigin);r.d.m(S,{as:typeof m.as=="string"&&m.as!=="script"?m.as:void 0,crossOrigin:y,integrity:typeof m.integrity=="string"?m.integrity:void 0,nonce:typeof m.nonce=="string"?m.nonce:void 0,fetchPriority:typeof m.fetchPriority=="string"?m.fetchPriority:void 0})}else r.d.m(S)},wn.requestFormReset=function(S){r.d.r(S)},wn.unstable_batchedUpdates=function(S,m){return S(m)},wn.useFormState=function(S,m,y){return g.H.useFormState(S,m,y)},wn.useFormStatus=function(){return g.H.useHostTransitionStatus()},wn.version="19.3.1",wn}var sv;function UM(){if(sv)return od.exports;sv=1;function o(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o)}catch(e){console.error(e)}}return o(),od.exports=DM(),od.exports}var rv;function NM(){if(rv)return il;rv=1;var o=wM(),e=Dp(),i=UM();function r(t){var n="https://react.dev/errors/"+t;if(1<arguments.length){n+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)n+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+t+"; visit "+n+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function u(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function f(t){for(var n=t,a=n;a&&!a.alternate;)n=a,(n.flags&4098)!==0&&(t=n.return),a=n.return;for(;n.return;)n=n.return;return n.tag===3?t:null}function h(t){if(t.tag===13){var n=t.memoizedState;if(n===null&&(t=t.alternate,t!==null&&(n=t.memoizedState)),n!==null)return n.dehydrated}return null}function d(t){if(t.tag===31){var n=t.memoizedState;if(n===null&&(t=t.alternate,t!==null&&(n=t.memoizedState)),n!==null)return n.dehydrated}return null}function g(t){if(f(t)!==t)throw Error(r(188))}function _(t){var n=t.alternate;if(!n){if(n=f(t),n===null)throw Error(r(188));return n!==t?null:t}for(var a=t,s=n;;){var l=a.return;if(l===null)break;var c=l.alternate;if(c===null){if(s=l.return,s!==null){a=s;continue}break}if(l.child===c.child){for(c=l.child;c;){if(c===a)return g(l),t;if(c===s)return g(l),n;c=c.sibling}throw Error(r(188))}if(a.return!==s.return)a=l,s=c;else{for(var p=!1,E=l.child;E;){if(E===a){p=!0,a=l,s=c;break}if(E===s){p=!0,s=l,a=c;break}E=E.sibling}if(!p){for(E=c.child;E;){if(E===a){p=!0,a=c,s=l;break}if(E===s){p=!0,s=c,a=l;break}E=E.sibling}if(!p)throw Error(r(189))}}if(a.alternate!==s)throw Error(r(190))}if(a.tag!==3)throw Error(r(188));return a.stateNode.current===a?t:n}function S(t){var n=t.tag;if(n===5||n===26||n===27||n===6)return t;for(t=t.child;t!==null;){if(n=S(t),n!==null)return n;t=t.sibling}return null}function m(t,n,a,s,l,c){for(;t!==null;){if((t.tag===5||t.tag===27||t.tag===6)&&a(t,s,l,c)||(t.tag!==22||t.memoizedState===null)&&(n||t.tag!==5&&t.tag!==27)&&m(t.child,n,a,s,l,c))return!0;t=t.sibling}return!1}function y(t){for(t=t.return;t!==null;){if(t.tag===3||t.tag===5||t.tag===27)return t;t=t.return}return null}function M(t){var n=!1;for(t=t.return;t!==null&&(t.tag===4&&(n=!0),!(t.tag===3||t.tag===5||t.tag===27));)t=t.return;return n}function A(t){var n=[null,null],a=y(t);return a===null||R(n,t,a.child,{foundSelf:!1}),n}function R(t,n,a,s){for(;a!==null;){if(a===n)s.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(s.foundSelf)return t[1]=a,!0;t[0]=a}else if((a.tag!==22||a.memoizedState===null)&&R(t,n,a.child,s))return!0;a=a.sibling}return!1}function x(t){switch(t.tag){case 5:case 27:case 6:return t.stateNode;case 3:return t.stateNode.containerInfo;default:throw Error(r(559))}}var v=null,z=null;function P(t,n,a){return t===a?!0:t===n?(v=t,!0):!1}function D(t,n,a){return t===a?(z=t,!1):t===n?(z!==null&&(v=t),!0):!1}function H(t){if(t===null)return null;do t=t===null?null:t.return;while(t&&t.tag!==5&&t.tag!==27&&t.tag!==3);return t||null}function B(t,n,a){for(var s=0,l=t;l;l=a(l))s++;l=0;for(var c=n;c;c=a(c))l++;for(;0<s-l;)t=a(t),s--;for(;0<l-s;)n=a(n),l--;for(;s--;){if(t===n||n!==null&&t===n.alternate)return t;t=a(t),n=a(n)}return null}var O=Object.assign,k=Symbol.for("react.element"),w=Symbol.for("react.transitional.element"),C=Symbol.for("react.portal"),V=Symbol.for("react.fragment"),at=Symbol.for("react.strict_mode"),ut=Symbol.for("react.profiler"),_t=Symbol.for("react.consumer"),lt=Symbol.for("react.context"),W=Symbol.for("react.forward_ref"),st=Symbol.for("react.suspense"),Z=Symbol.for("react.suspense_list"),gt=Symbol.for("react.memo"),St=Symbol.for("react.lazy"),Ht=Symbol.for("react.activity"),se=Symbol.for("react.legacy_hidden"),Te=Symbol.for("react.memo_cache_sentinel"),I=Symbol.for("react.view_transition"),ct=Symbol.for("react.recoverable"),J=Symbol.iterator;function it(t){return t===null||typeof t!="object"?null:(t=J&&t[J]||t["@@iterator"],typeof t=="function"?t:null)}var xt=Symbol.for("react.client.reference");function Ut(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===xt?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case V:return"Fragment";case ut:return"Profiler";case at:return"StrictMode";case st:return"Suspense";case Z:return"SuspenseList";case Ht:return"Activity";case I:return"ViewTransition"}if(typeof t=="object")switch(t.$$typeof){case C:return"Portal";case lt:return t.displayName||"Context";case _t:return(t._context.displayName||"Context")+".Consumer";case W:var n=t.render;return t=t.displayName,t||(t=n.displayName||n.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case gt:return n=t.displayName||null,n!==null?n:Ut(t.type)||"Memo";case St:n=t._payload,t=t._init;try{return Ut(t(n))}catch{}}return null}var At=Array.isArray,Mt=e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Yt=i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,L={pending:!1,data:null,method:null,action:null},Fe=[],ae=-1;function Kt(t){return{current:t}}function Nt(t){0>ae||(t.current=Fe[ae],Fe[ae]=null,ae--)}function ne(t,n){ae++,Fe[ae]=t.current,t.current=n}var Bt=Kt(null),re=Kt(null),ke=Kt(null),qe=Kt(null);function U(t,n){switch(ne(ke,n),ne(re,t),ne(Bt,null),n.nodeType){case 9:case 11:t=(t=n.documentElement)&&(t=t.namespaceURI)?o0(t):0;break;default:if(t=n.tagName,n=n.namespaceURI)n=o0(n),t=l0(n,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}Nt(Bt),ne(Bt,t)}function T(){Nt(Bt),Nt(re),Nt(ke)}function tt(t){var n=t.memoizedState;n!==null&&(Or._currentValue=n.memoizedState,ne(qe,t)),n=Bt.current;var a=l0(n,t.type);n!==a&&(ne(re,t),ne(Bt,a))}function dt(t){re.current===t&&(Nt(Bt),Nt(re)),qe.current===t&&(Nt(qe),Or._currentValue=L)}var vt,ft;function Vt(t){if(vt===void 0)try{throw Error()}catch(a){var n=a.stack.trim().match(/\n( *(at )?)/);vt=n&&n[1]||"",ft=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+vt+t+ft}var Rt=!1;function Wt(t,n){if(!t||Rt)return"";Rt=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var s={DetermineComponentFrameRoot:function(){try{if(n){var pt=function(){throw Error()};if(Object.defineProperty(pt.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(pt,[])}catch(Dt){var X=Dt}Reflect.construct(t,[],pt)}else{try{pt.call()}catch(Dt){X=Dt}pt=!1;try{var $=Object.getOwnPropertyDescriptor(t.prototype,"props");Object.defineProperty(t.prototype,"props",{configurable:!0,set:function(){throw Error()}}),pt=!0,new t}finally{pt&&($!==void 0?Object.defineProperty(t.prototype,"props",$):delete t.prototype.props)}}}else{try{throw Error()}catch(Dt){X=Dt}(pt=t())&&typeof pt.catch=="function"&&pt.catch(function(){})}}catch(Dt){if(Dt&&X&&typeof Dt.stack=="string")return[Dt.stack,X.stack]}return[null,null]}};s.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var l=Object.getOwnPropertyDescriptor(s.DetermineComponentFrameRoot,"name");l&&l.configurable&&Object.defineProperty(s.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var c=s.DetermineComponentFrameRoot(),p=c[0],E=c[1];if(p&&E){var N=p.split(`
`),q=E.split(`
`);for(l=s=0;s<N.length&&!N[s].includes("DetermineComponentFrameRoot");)s++;for(;l<q.length&&!q[l].includes("DetermineComponentFrameRoot");)l++;if(s===N.length||l===q.length)for(s=N.length-1,l=q.length-1;1<=s&&0<=l&&N[s]!==q[l];)l--;for(;1<=s&&0<=l;s--,l--)if(N[s]!==q[l]){if(s!==1||l!==1)do if(s--,l--,0>l||N[s]!==q[l]){var et=`
`+N[s].replace(" at new "," at ");return t.displayName&&et.includes("<anonymous>")&&(et=et.replace("<anonymous>",t.displayName)),et}while(1<=s&&0<=l);break}}}finally{Rt=!1,Error.prepareStackTrace=a}return(a=t?t.displayName||t.name:"")?Vt(a):""}function Zt(t,n){switch(t.tag){case 26:case 27:case 5:return Vt(t.type);case 16:return Vt("Lazy");case 13:return t.child!==n&&n!==null?Vt("Suspense Fallback"):Vt("Suspense");case 19:return Vt("SuspenseList");case 0:case 15:return Wt(t.type,!1);case 11:return Wt(t.type.render,!1);case 1:return Wt(t.type,!0);case 31:return Vt("Activity");case 30:return Vt("ViewTransition");default:return""}}function Tt(t){try{var n="",a=null;do n+=Zt(t,a),a=t,t=t.return;while(t);return n}catch(s){return`
Error generating stack: `+s.message+`
`+s.stack}}var Lt=Object.prototype.hasOwnProperty,ee=o.unstable_scheduleCallback,jt=o.unstable_cancelCallback,Ot=o.unstable_shouldYield,ue=o.unstable_requestPaint,G=o.unstable_now,bt=o.unstable_getCurrentPriorityLevel,wt=o.unstable_ImmediatePriority,Gt=o.unstable_UserBlockingPriority,yt=o.unstable_NormalPriority,mt=o.unstable_LowPriority,qt=o.unstable_IdlePriority,le=o.log,He=o.unstable_setDisableYieldValue,xe=null,$e=null;function pn(t){if(typeof le=="function"&&He(t),$e&&typeof $e.setStrictMode=="function")try{$e.setStrictMode(xe,t)}catch{}}var Un=Math.clz32?Math.clz32:El,ta=Math.log,fo=Math.LN2;function El(t){return t>>>=0,t===0?32:31-(ta(t)/fo|0)|0}var fs=256,ea=262144,hs=4194304;function ci(t){var n=t&42;if(n!==0)return n;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&-t;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function ds(t,n,a){var s=t.pendingLanes;if(s===0)return 0;var l=0,c=t.suspendedLanes,p=t.pingedLanes;t=t.warmLanes;var E=s&134217727;return E!==0?(s=E&~c,s!==0?l=ci(s):(p&=E,p!==0?l=ci(p):a||(a=E&~t,a!==0&&(l=ci(a))))):(E=s&~c,E!==0?l=ci(E):p!==0?l=ci(p):a||(a=s&~t,a!==0&&(l=ci(a)))),l===0?0:n!==0&&n!==l&&(n&c)===0&&(c=l&-l,a=n&-n,c>=a||c===32&&(a&4194048)!==0)?n:l}function Ta(t,n){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&n)===0}function Tl(t,n){(n&8)!==0&&(n|=n&32);var a=t.entangledLanes;if(a!==0)for(t=t.entanglements,a&=n;0<a;){var s=31-Un(a),l=1<<s;n|=t[s],a&=~l}return n}function wc(t,n){switch(t){case 1:case 2:case 4:case 8:case 64:return n+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function bl(){var t=hs;return hs<<=1,(hs&62914560)===0&&(hs=4194304),t}function ho(t){for(var n=[],a=0;31>a;a++)n.push(t);return n}function ps(t,n){t.pendingLanes|=n,n!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function Dc(t,n,a,s,l,c){var p=t.pendingLanes;t.pendingLanes=a,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=a,t.entangledLanes&=a,t.errorRecoveryDisabledLanes&=a,t.shellSuspendCounter=0;var E=t.entanglements,N=t.expirationTimes,q=t.hiddenUpdates;for(a=p&~a;0<a;){var et=31-Un(a),pt=1<<et;E[et]=0,N[et]=-1;var X=q[et];if(X!==null)for(q[et]=null,et=0;et<X.length;et++){var $=X[et];$!==null&&($.lane&=-536870913)}a&=~pt}s!==0&&b(t,s,0),c!==0&&l===0&&t.tag!==0&&(t.suspendedLanes|=c&~(p&~n))}function b(t,n,a){t.pendingLanes|=n,t.suspendedLanes&=~n;var s=31-Un(n);t.entangledLanes|=n,t.entanglements[s]=t.entanglements[s]|1073741824|a&261930}function j(t,n){var a=t.entangledLanes|=n;for(t=t.entanglements;a;){var s=31-Un(a),l=1<<s;l&n|t[s]&n&&(t[s]|=n),a&=~l}}function rt(t,n){var a=n&-n;return a=(a&42)!==0?1:ot(a),(a&(t.suspendedLanes|n))!==0?0:a}function ot(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function K(t){return t&=-t,2<t?8<t?(t&134217727)!==0?32:268435456:8:2}function Et(){var t=Yt.p;return t!==0?t:(t=window.event,t===void 0?32:Y0(t.type))}function Pt(t,n){var a=Yt.p;try{return Yt.p=t,n()}finally{Yt.p=a}}var It=Math.random().toString(36).slice(2),Ct="__reactFiber$"+It,Xt="__reactProps$"+It,te="__reactContainer$"+It,Jt="__reactEvents$"+It,ge="__reactListeners$"+It,Oe="__reactHandles$"+It,Qe="__reactResources$"+It,Ue="__reactMarker$"+It,Ae="__reactLoad$"+It;function $t(t){delete t[Ct],delete t[Xt],delete t[ge],delete t[Oe]}function Ne(t){var n;if(n=t[Ct])return n;for(var a=t.parentNode;a;){if(n=a[te]||a[Ct]){if(a=n.alternate,n.child!==null||a!==null&&a.child!==null)for(t=b0(t);t!==null;){if(a=t[Ct])return a;t=b0(t)}return n}t=a,a=t.parentNode}return null}function me(t){if(t=t[Ct]||t[te]){var n=t.tag;if(n===5||n===6||n===13||n===31||n===26||n===27||n===3)return t}return null}function mn(t){var n=t.tag;if(n===5||n===26||n===27||n===6)return t.stateNode;throw Error(r(33))}function Qn(t){var n=t[Qe];return n||(n=t[Qe]={hoistableStyles:new Map,hoistableScripts:new Map}),n}function Re(t){t[Ue]=!0}function ba(t){t[Ae]=void 0}var We=new Set,zn={};function ln(t,n){en(t,n),en(t+"Capture",n)}function en(t,n){for(zn[t]=n,t=0;t<n.length;t++)We.add(n[t])}var Nn=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Qs={},Pi={};function kS(t){return Lt.call(Pi,t)?!0:Lt.call(Qs,t)?!1:Nn.test(t)?Pi[t]=!0:(Qs[t]=!0,!1)}var Ce=!1;function Wp(){var t=Ce;return Ce=!1,t}function Al(t,n,a){if(kS(n))if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":t.removeAttribute(n);return;case"boolean":var s=n.toLowerCase().slice(0,5);if(s!=="data-"&&s!=="aria-"){t.removeAttribute(n);return}}t.setAttribute(n,a)}}function Rl(t,n,a){if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttribute(n,a)}}function na(t,n,a,s){if(s===null)t.removeAttribute(a);else{switch(typeof s){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(a);return}t.setAttributeNS(n,a,s)}}function Jn(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function jp(t){var n=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(n==="checkbox"||n==="radio")}function YS(t,n,a){var s=Object.getOwnPropertyDescriptor(t.constructor.prototype,n);if(!t.hasOwnProperty(n)&&typeof s<"u"&&typeof s.get=="function"&&typeof s.set=="function"){var l=s.get,c=s.set;return Object.defineProperty(t,n,{configurable:!0,get:function(){return l.call(this)},set:function(p){a=""+p,c.call(this,p)}}),Object.defineProperty(t,n,{enumerable:s.enumerable}),{getValue:function(){return a},setValue:function(p){a=""+p},stopTracking:function(){t._valueTracker=null,delete t[n]}}}}function Uc(t){if(!t._valueTracker){var n=jp(t)?"checked":"value";t._valueTracker=YS(t,n,""+t[n])}}function Zp(t){if(!t)return!1;var n=t._valueTracker;if(!n)return!0;var a=n.getValue(),s="";return t&&(s=jp(t)?t.checked?"true":"false":t.value),t=s,t!==a?(n.setValue(t),!0):!1}var qS=/[\n"\\]/g;function fi(t){return t.replace(qS,function(n){return"\\"+n.charCodeAt(0).toString(16)+" "})}function Nc(t,n,a,s,l,c,p,E){t.name="",p!=null&&typeof p!="function"&&typeof p!="symbol"&&typeof p!="boolean"?t.type=p:t.removeAttribute("type"),n!=null?p==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+Jn(n)):t.value!==""+Jn(n)&&(t.value=""+Jn(n)):p!=="submit"&&p!=="reset"||t.removeAttribute("value"),n!=null?p==="number"&&t.value==n?Lc(t,Jn(t.value)):Lc(t,Jn(n)):a!=null?Lc(t,Jn(a)):s!=null&&t.removeAttribute("value"),l==null&&c!=null&&(t.defaultChecked=!!c),l!=null&&(t.checked=l&&typeof l!="function"&&typeof l!="symbol"),E!=null&&typeof E!="function"&&typeof E!="symbol"&&typeof E!="boolean"?t.name=""+Jn(E):t.removeAttribute("name")}function Kp(t,n,a,s,l,c,p,E){if(c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(t.type=c),n!=null||a!=null){if(!(c!=="submit"&&c!=="reset"||n!=null)){Uc(t);return}a=a!=null?""+Jn(a):"",n=n!=null?""+Jn(n):a,E||n===t.value||(t.value=n),t.defaultValue=n}s=s??l,s=typeof s!="function"&&typeof s!="symbol"&&!!s,t.checked=E?t.checked:!!s,t.defaultChecked=!!s,p!=null&&typeof p!="function"&&typeof p!="symbol"&&typeof p!="boolean"&&(t.name=p),Uc(t)}function Lc(t,n){t.defaultValue!==""+n&&(t.defaultValue=""+n)}function Js(t,n,a,s){if(t=t.options,n){n={};for(var l=0;l<a.length;l++)n["$"+a[l]]=!0;for(a=0;a<t.length;a++)l=n.hasOwnProperty("$"+t[a].value),t[a].selected!==l&&(t[a].selected=l),l&&s&&(t[a].defaultSelected=!0)}else{for(a=""+Jn(a),n=null,l=0;l<t.length;l++){if(t[l].value===a){t[l].selected=!0,s&&(t[l].defaultSelected=!0);return}n!==null||t[l].disabled||(n=t[l])}n!==null&&(n.selected=!0)}}function Qp(t,n,a){if(n!=null&&(n=""+Jn(n),n!==t.value&&(t.value=n),a==null)){t.defaultValue!==n&&(t.defaultValue=n);return}t.defaultValue=a!=null?""+Jn(a):""}function Jp(t,n,a,s){if(n==null){if(s!=null){if(a!=null)throw Error(r(92));if(At(s)){if(1<s.length)throw Error(r(93));s=s[0]}a=s}a==null&&(a=""),n=a}a=Jn(n),t.defaultValue=a,s=t.textContent,s===a&&s!==""&&s!==null&&(t.value=s),Uc(t)}function $s(t,n){if(n){var a=t.firstChild;if(a&&a===t.lastChild&&a.nodeType===3){a.nodeValue=n;return}}t.textContent=n}var WS=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function $p(t,n,a){var s=n.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?s?t.setProperty(n,""):n==="float"?t.cssFloat="":t[n]="":s?t.setProperty(n,a):typeof a!="number"||a===0||WS.has(n)?n==="float"?t.cssFloat=a:t[n]=(""+a).trim():t[n]=a+"px"}function tm(t,n,a){if(n!=null&&typeof n!="object")throw Error(r(62));if(t=t.style,a!=null){for(var s in a)!a.hasOwnProperty(s)||n!=null&&n.hasOwnProperty(s)||(s.indexOf("--")===0?t.setProperty(s,""):s==="float"?t.cssFloat="":t[s]="",Ce=!0);for(var l in n)s=n[l],n.hasOwnProperty(l)&&a[l]!==s&&($p(t,l,s),Ce=!0)}else for(var c in n)n.hasOwnProperty(c)&&$p(t,c,n[c])}function Oc(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var jS=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),ZS=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Cl(t){return ZS.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function zi(){}var Pc=null;function zc(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var tr=null,er=null;function em(t){var n=me(t);if(n&&(t=n.stateNode)){var a=t[Xt]||null;t:switch(t=n.stateNode,n.type){case"input":if(Nc(t,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),n=a.name,a.type==="radio"&&n!=null){for(a=t;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+fi(""+n)+'"][type="radio"]'),n=0;n<a.length;n++){var s=a[n];if(s!==t&&s.form===t.form){var l=s[Xt]||null;if(!l)throw Error(r(90));Nc(s,l.value,l.defaultValue,l.defaultValue,l.checked,l.defaultChecked,l.type,l.name)}}for(n=0;n<a.length;n++)s=a[n],s.form===t.form&&Zp(s)}break t;case"textarea":Qp(t,a.value,a.defaultValue);break t;case"select":n=a.value,n!=null&&Js(t,!!a.multiple,n,!1)}}}var Ic=!1;function nm(t,n,a){if(Ic)return t(n,a);Ic=!0;try{var s=t(n);return s}finally{if(Ic=!1,(tr!==null||er!==null)&&(Cu(),tr&&(n=tr,t=er,er=tr=null,em(n),t)))for(n=0;n<t.length;n++)em(t[n])}}function po(t,n){var a=t.stateNode;if(a===null)return null;var s=a[Xt]||null;if(s===null)return null;a=s[n];t:switch(n){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(s=!s.disabled)||(t=t.type,s=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!s;break t;default:t=!1}if(t)return null;if(a&&typeof a!="function")throw Error(r(231,n,typeof a));return a}var ia=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Bc=!1;if(ia)try{var mo={};Object.defineProperty(mo,"passive",{get:function(){Bc=!0}}),window.addEventListener("test",mo,mo),window.removeEventListener("test",mo,mo)}catch{Bc=!1}var Aa=null,Fc=null,wl=null;function im(){if(wl)return wl;var t,n=Fc,a=n.length,s,l="value"in Aa?Aa.value:Aa.textContent,c=l.length;for(t=0;t<a&&n[t]===l[t];t++);var p=a-t;for(s=1;s<=p&&n[a-s]===l[c-s];s++);return wl=l.slice(t,1<s?1-s:void 0)}function Dl(t){var n=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&n===13&&(t=13)):t=n,t===10&&(t=13),32<=t||t===13?t:0}function Ul(){return!0}function am(){return!1}function In(t){function n(a,s,l,c,p){this._reactName=a,this._targetInst=l,this.type=s,this.nativeEvent=c,this.target=p,this.currentTarget=null;for(var E in t)t.hasOwnProperty(E)&&(a=t[E],this[E]=a?a(c):c[E]);return this.isDefaultPrevented=(c.defaultPrevented!=null?c.defaultPrevented:c.returnValue===!1)?Ul:am,this.isPropagationStopped=am,this}return O(n.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Ul)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Ul)},persist:function(){},isPersistent:Ul}),n}var Ra={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Nl=In(Ra),_o=O({},Ra,{view:0,detail:0}),KS=In(_o),Hc,Gc,go,Ll=O({},_o,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Xc,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==go&&(go&&t.type==="mousemove"?(Hc=t.screenX-go.screenX,Gc=t.screenY-go.screenY):Gc=Hc=0,go=t),Hc)},movementY:function(t){return"movementY"in t?t.movementY:Gc}}),sm=In(Ll),QS=O({},Ll,{dataTransfer:0}),JS=In(QS),$S=O({},_o,{relatedTarget:0}),Vc=In($S),ty=O({},Ra,{animationName:0,elapsedTime:0,pseudoElement:0}),ey=In(ty),ny=O({},Ra,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),iy=In(ny),ay=O({},Ra,{data:0}),rm=In(ay),sy={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},ry={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},oy={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function ly(t){var n=this.nativeEvent;return n.getModifierState?n.getModifierState(t):(t=oy[t])?!!n[t]:!1}function Xc(){return ly}var uy=O({},_o,{key:function(t){if(t.key){var n=sy[t.key]||t.key;if(n!=="Unidentified")return n}return t.type==="keypress"?(t=Dl(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?ry[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Xc,charCode:function(t){return t.type==="keypress"?Dl(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Dl(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),cy=In(uy),fy=O({},Ll,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),om=In(fy),hy=O({},Ra,{submitter:0}),dy=In(hy),py=O({},_o,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Xc}),my=In(py),_y=O({},Ra,{propertyName:0,elapsedTime:0,pseudoElement:0}),gy=In(_y),vy=O({},Ll,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),Sy=In(vy),yy=O({},Ra,{newState:0,oldState:0,source:0}),xy=In(yy),My=[9,13,27,32],kc=ia&&"CompositionEvent"in window,vo=null;ia&&"documentMode"in document&&(vo=document.documentMode);var Ey=ia&&"TextEvent"in window&&!vo,lm=ia&&(!kc||vo&&8<vo&&11>=vo),um=" ",cm=!1;function fm(t,n){switch(t){case"keyup":return My.indexOf(n.keyCode)!==-1;case"keydown":return n.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function hm(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var nr=!1;function Ty(t,n){switch(t){case"compositionend":return hm(n);case"keypress":return n.which!==32?null:(cm=!0,um);case"textInput":return t=n.data,t===um&&cm?null:t;default:return null}}function by(t,n){if(nr)return t==="compositionend"||!kc&&fm(t,n)?(t=im(),wl=Fc=Aa=null,nr=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(n.ctrlKey||n.altKey||n.metaKey)||n.ctrlKey&&n.altKey){if(n.char&&1<n.char.length)return n.char;if(n.which)return String.fromCharCode(n.which)}return null;case"compositionend":return lm&&n.locale!=="ko"?null:n.data;default:return null}}var Ay={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function dm(t){var n=t&&t.nodeName&&t.nodeName.toLowerCase();return n==="input"?!!Ay[t.type]:n==="textarea"}function pm(t,n,a,s){tr?er?er.push(s):er=[s]:tr=s,n=Ou(n,"onChange"),0<n.length&&(a=new Nl("onChange","change",null,a,s),t.push({event:a,listeners:n}))}var So=null,yo=null;function Ry(t){e0(t,0)}function Ol(t){var n=mn(t);if(Zp(n))return t}function mm(t,n){if(t==="change")return n}var _m=!1;if(ia){var Yc;if(ia){var qc="oninput"in document;if(!qc){var gm=document.createElement("div");gm.setAttribute("oninput","return;"),qc=typeof gm.oninput=="function"}Yc=qc}else Yc=!1;_m=Yc&&(!document.documentMode||9<document.documentMode)}function vm(){So&&(So.detachEvent("onpropertychange",Sm),yo=So=null)}function Sm(t){if(t.propertyName==="value"&&Ol(yo)){var n=[];pm(n,yo,t,zc(t)),nm(Ry,n)}}function Cy(t,n,a){t==="focusin"?(vm(),So=n,yo=a,So.attachEvent("onpropertychange",Sm)):t==="focusout"&&vm()}function wy(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Ol(yo)}function Dy(t,n){if(t==="click")return Ol(n)}function Uy(t,n){if(t==="input"||t==="change")return Ol(n)}function Ny(t,n){return t===n&&(t!==0||1/t===1/n)||t!==t&&n!==n}var $n=typeof Object.is=="function"?Object.is:Ny;function xo(t,n){if($n(t,n))return!0;if(typeof t!="object"||t===null||typeof n!="object"||n===null)return!1;var a=Object.keys(t),s=Object.keys(n);if(a.length!==s.length)return!1;for(s=0;s<a.length;s++){var l=a[s];if(!Lt.call(n,l)||!$n(t[l],n[l]))return!1}return!0}function Wc(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function ym(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function xm(t,n){var a=ym(t);t=0;for(var s;a;){if(a.nodeType===3){if(s=t+a.textContent.length,t<=n&&s>=n)return{node:a,offset:n-t};t=s}t:{for(;a;){if(a.nextSibling){a=a.nextSibling;break t}a=a.parentNode}a=void 0}a=ym(a)}}function Mm(t,n){return t&&n?t===n?!0:t&&t.nodeType===3?!1:n&&n.nodeType===3?Mm(t,n.parentNode):"contains"in t?t.contains(n):t.compareDocumentPosition?!!(t.compareDocumentPosition(n)&16):!1:!1}function Em(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var n=Wc(t.document);n instanceof t.HTMLIFrameElement;){try{var a=typeof n.contentWindow.location.href=="string"}catch{a=!1}if(a)t=n.contentWindow;else break;n=Wc(t.document)}return n}function jc(t){var n=t&&t.nodeName&&t.nodeName.toLowerCase();return n&&(n==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||n==="textarea"||t.contentEditable==="true")}var Ly=ia&&"documentMode"in document&&11>=document.documentMode,ir=null,Zc=null,Mo=null,Kc=!1;function Tm(t,n,a){var s=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Kc||ir==null||ir!==Wc(s)||(s=ir,"selectionStart"in s&&jc(s)?s={start:s.selectionStart,end:s.selectionEnd}:(s=(s.ownerDocument&&s.ownerDocument.defaultView||window).getSelection(),s={anchorNode:s.anchorNode,anchorOffset:s.anchorOffset,focusNode:s.focusNode,focusOffset:s.focusOffset}),Mo&&xo(Mo,s)||(Mo=s,s=Ou(Zc,"onSelect"),0<s.length&&(n=new Nl("onSelect","select",null,n,a),t.push({event:n,listeners:s}),n.target=ir)))}function ms(t,n){var a={};return a[t.toLowerCase()]=n.toLowerCase(),a["Webkit"+t]="webkit"+n,a["Moz"+t]="moz"+n,a}var ar={animationend:ms("Animation","AnimationEnd"),animationiteration:ms("Animation","AnimationIteration"),animationstart:ms("Animation","AnimationStart"),transitionrun:ms("Transition","TransitionRun"),transitionstart:ms("Transition","TransitionStart"),transitioncancel:ms("Transition","TransitionCancel"),transitionend:ms("Transition","TransitionEnd")},Qc={},bm={};ia&&(bm=document.createElement("div").style,"AnimationEvent"in window||(delete ar.animationend.animation,delete ar.animationiteration.animation,delete ar.animationstart.animation),"TransitionEvent"in window||delete ar.transitionend.transition);function _s(t){if(Qc[t])return Qc[t];if(!ar[t])return t;var n=ar[t],a;for(a in n)if(n.hasOwnProperty(a)&&a in bm)return Qc[t]=n[a];return t}var Am=_s("animationend"),Rm=_s("animationiteration"),Cm=_s("animationstart"),Oy=_s("transitionrun"),Py=_s("transitionstart"),zy=_s("transitioncancel"),wm=_s("transitionend"),Dm=new Map,Jc="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Jc.push("scrollEnd");function Ei(t,n){Dm.set(t,n),ln(n,[t])}var Iy=0;function aa(t,n){if(t.name!=null&&t.name!=="auto")return t.name;if(n.autoName!==null)return n.autoName;t=Ri.identifierPrefix;var a=Iy++;return t="_"+t+"t_"+a.toString(32)+"_",n.autoName=t}function Um(t){if(t==null||typeof t=="string")return t;var n=null,a=Tr;if(a!==null)for(var s=0;s<a.length;s++){var l=t[a[s]];if(l!=null){if(l==="none")return"none";n=n==null?l:n+(" "+l)}}return n??t.default}function sa(t,n){return t=Um(t),n=Um(n),n==null?t==="auto"?null:t:n==="auto"?null:n}var Pl=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var n=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(n))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},hi=[],sr=0,$c=0;function zl(){for(var t=sr,n=$c=sr=0;n<t;){var a=hi[n];hi[n++]=null;var s=hi[n];hi[n++]=null;var l=hi[n];hi[n++]=null;var c=hi[n];if(hi[n++]=null,s!==null&&l!==null){var p=s.pending;p===null?l.next=l:(l.next=p.next,p.next=l),s.pending=l}c!==0&&Nm(a,l,c)}}function Il(t,n,a,s){hi[sr++]=t,hi[sr++]=n,hi[sr++]=a,hi[sr++]=s,$c|=s,t.lanes|=s,t=t.alternate,t!==null&&(t.lanes|=s)}function tf(t,n,a,s){return Il(t,n,a,s),Bl(t)}function gs(t,n){return Il(t,null,null,n),Bl(t)}function Nm(t,n,a){t.lanes|=a;var s=t.alternate;s!==null&&(s.lanes|=a);for(var l=!1,c=t.return;c!==null;)c.childLanes|=a,s=c.alternate,s!==null&&(s.childLanes|=a),c.tag===22&&(t=c.stateNode,t===null||t._visibility&1||(l=!0)),t=c,c=c.return;return t.tag===3?(c=t.stateNode,l&&n!==null&&(l=31-Un(a),t=c.hiddenUpdates,s=t[l],s===null?t[l]=[n]:s.push(n),n.lane=a|536870912),c):null}function Bl(t){if(50<ko)throw ko=0,Ru=null,Error(r(185));for(var n=t.return;n!==null;)t=n,n=t.return;return t.tag===3?t.stateNode:null}var rr={};function By(t,n,a,s){this.tag=t,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=n,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=s,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function kn(t,n,a,s){return new By(t,n,a,s)}function ef(t){return t=t.prototype,!(!t||!t.isReactComponent)}function ra(t,n){var a=t.alternate;return a===null?(a=kn(t.tag,n,t.key,t.mode),a.elementType=t.elementType,a.type=t.type,a.stateNode=t.stateNode,a.alternate=t,t.alternate=a):(a.pendingProps=n,a.type=t.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=t.flags&1206910976,a.childLanes=t.childLanes,a.lanes=t.lanes,a.child=t.child,a.memoizedProps=t.memoizedProps,a.memoizedState=t.memoizedState,a.updateQueue=t.updateQueue,n=t.dependencies,a.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext},a.sibling=t.sibling,a.index=t.index,a.ref=t.ref,a.refCleanup=t.refCleanup,a}function Lm(t,n){t.flags&=1206910978;var a=t.alternate;return a===null?(t.childLanes=0,t.lanes=n,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=a.childLanes,t.lanes=a.lanes,t.child=a.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=a.memoizedProps,t.memoizedState=a.memoizedState,t.updateQueue=a.updateQueue,t.type=a.type,n=a.dependencies,t.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),t}function Fl(t,n,a,s,l,c){var p=0;if(s=t,typeof s=="function")ef(s)&&(p=1);else if(typeof s=="string")p=hM(t,a,Bt.current)?26:t==="html"||t==="head"||t==="body"?27:5;else t:switch(s){case Ht:return t=kn(31,a,n,l),t.elementType=Ht,t.lanes=c,t;case V:return vs(a.children,l,c,n);case at:p=8,l|=24;break;case ut:return t=kn(12,a,n,l|2),t.elementType=ut,t.lanes=c,t;case st:return t=kn(13,a,n,l),t.elementType=st,t.lanes=c,t;case Z:return t=kn(19,a,n,l),t.elementType=Z,t.lanes=c,t;case se:case I:return t=l|32,t=kn(30,a,n,t),t.elementType=I,t.lanes=c,t.stateNode={autoName:null,paired:null,clones:null,ref:null},t;default:if(typeof s=="object"&&s!==null)switch(s.$$typeof){case lt:p=10;break t;case _t:p=9;break t;case W:p=11;break t;case gt:p=14;break t;case St:p=16,s=null;break t}p=29,a=Error(r(130,t===null?"null":typeof t,"")),s=null}return n=kn(p,a,n,l),n.elementType=t,n.type=s,n.lanes=c,n}function vs(t,n,a,s){return t=kn(7,t,s,n),t.lanes=a,t}function nf(t,n,a){return t=kn(6,t,null,n),t.lanes=a,t}function Om(t){var n=kn(18,null,null,0);return n.stateNode=t,n}function af(t,n,a){return n=kn(4,t.children!==null?t.children:[],t.key,n),n.lanes=a,n.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},n}var Pm=new WeakMap;function di(t,n){if(typeof t=="object"&&t!==null){var a=Pm.get(t);return a!==void 0?a:(n={value:t,source:n,stack:Tt(n)},Pm.set(t,n),n)}return{value:t,source:n,stack:Tt(n)}}var or=[],lr=0,Hl=null,Eo=0,pi=[],mi=0,Ca=null,Ii=1,Bi="";function oa(t,n){or[lr++]=Eo,or[lr++]=Hl,Hl=t,Eo=n}function zm(t,n,a){pi[mi++]=Ii,pi[mi++]=Bi,pi[mi++]=Ca,Ca=t;var s=Ii;t=Bi;var l=32-Un(s)-1;s&=~(1<<l),a+=1;var c=32-Un(n)+l;if(30<c){var p=l-l%5;c=(s&(1<<p)-1).toString(32),s>>=p,l-=p,Ii=1<<32-Un(n)+l|a<<l|s,Bi=c+t}else Ii=1<<c|a<<l|s,Bi=t}function Gl(t){t.return!==null&&(oa(t,1),zm(t,1,0))}function sf(t){for(;t===Hl;)Hl=or[--lr],or[lr]=null,Eo=or[--lr],or[lr]=null;for(;t===Ca;)Ca=pi[--mi],pi[mi]=null,Bi=pi[--mi],pi[mi]=null,Ii=pi[--mi],pi[mi]=null}function Im(t,n){pi[mi++]=Ii,pi[mi++]=Bi,pi[mi++]=Ca,Ii=n.id,Bi=n.overflow,Ca=t}var yn=null,je=null,_e=!1,wa=null,_i=!1,rf=Error(r(519));function Da(t){var n=Error(r(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw To(di(n,t)),rf}function Bm(t){var n=t.stateNode,a=t.type,s=t.memoizedProps;switch(n[Ct]=t,n[Xt]=s,a){case"dialog":ye("cancel",n),ye("close",n);break;case"iframe":case"object":case"embed":ye("load",n);break;case"video":case"audio":for(a=0;a<qo.length;a++)ye(qo[a],n);break;case"source":ye("error",n);break;case"img":case"image":case"link":ye("error",n),ye("load",n);break;case"details":ye("toggle",n);break;case"input":ye("invalid",n),Kp(n,s.value,s.defaultValue,s.checked,s.defaultChecked,s.type,s.name,!0);break;case"select":ye("invalid",n);break;case"textarea":ye("invalid",n),Jp(n,s.value,s.defaultValue,s.children)}a=s.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||n.textContent===""+a||s.suppressHydrationWarning===!0||s0(n.textContent,a)?(s.popover!=null&&(ye("beforetoggle",n),ye("toggle",n)),s.onScroll!=null&&ye("scroll",n),s.onScrollEnd!=null&&ye("scrollend",n),s.onClick!=null&&(n.onclick=zi),n=!0):n=!1,n||Da(t,!0)}function Vl(t){for(yn=t.return;yn;)switch(yn.tag){case 5:case 31:case 13:_i=!1;return;case 27:case 3:_i=!0;return;default:yn=yn.return}}function ur(t){if(t!==yn)return!1;if(!_e)return Vl(t),_e=!0,!1;var n=t.tag,a;if((a=n!==3&&n!==27)&&((a=n===5)&&(a=t.type,a=!(a!=="form"&&a!=="button")||zh(t.type,t.memoizedProps)),a=!a),a&&je&&Da(t),Vl(t),n===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(r(317));je=T0(t)}else if(n===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(r(317));je=T0(t)}else n===27?(n=je,qa(t.type)?(t=Yh,Yh=null,je=t):je=n):je=yn?vi(t.stateNode.nextSibling):null;return!0}function Ss(){je=yn=null,_e=!1}function of(){var t=wa;return t!==null&&(Wn===null?Wn=t:Wn.push.apply(Wn,t),wa=null),t}function To(t){wa===null?wa=[t]:wa.push(t)}var lf=Kt(null),ys=null,la=null;function Ua(t,n,a){ne(lf,n._currentValue),n._currentValue=a}function ua(t){t._currentValue=lf.current,Nt(lf)}function Xl(t,n,a){for(;t!==null;){var s=t.alternate;if((t.childLanes&n)!==n?(t.childLanes|=n,s!==null&&(s.childLanes|=n)):s!==null&&(s.childLanes&n)!==n&&(s.childLanes|=n),t===a)break;t=t.return}}function uf(t,n,a,s){var l=t.child;for(l!==null&&(l.return=t);l!==null;){var c=l.dependencies;if(c!==null){var p=l.child;c=c.firstContext;t:for(;c!==null;){var E=c;c=l;for(var N=0;N<n.length;N++)if(E.context===n[N]){c.lanes|=a,E=c.alternate,E!==null&&(E.lanes|=a),Xl(c.return,a,t),s||(p=null);break t}c=E.next}}else if(l.tag===18){if(p=l.return,p===null)throw Error(r(341));p.lanes|=a,c=p.alternate,c!==null&&(c.lanes|=a),Xl(p,a,t),p=null}else l.tag===13&&l.memoizedState!==null&&l.memoizedState.dehydrated===null?(l.lanes|=a,p=l.alternate,p!==null&&(p.lanes|=a),Xl(l.return,a,t),p=l.child,p=p!==null?p.sibling:null):p=l.child;if(p!==null)p.return=l;else for(p=l;p!==null;){if(p===t){p=null;break}if(l=p.sibling,l!==null){l.return=p.return,p=l;break}p=p.return}l=p}}function xs(t,n,a,s){t=null;for(var l=n,c=!1;l!==null;){if(!c){if((l.flags&524288)!==0)c=!0;else if((l.flags&262144)!==0)break}if(l.tag===10){var p=l.alternate;if(p===null)throw Error(r(387));if(p=p.memoizedProps,p!==null){var E=l.type;$n(l.pendingProps.value,p.value)||(t!==null?t.push(E):t=[E])}}else if(l===qe.current){if(p=l.alternate,p===null)throw Error(r(387));p.memoizedState.memoizedState!==l.memoizedState.memoizedState&&(t!==null?t.push(Or):t=[Or])}l=l.return}return t!==null&&uf(n,t,a,s),n.flags|=262144,t!==null}function kl(t){for(t=t.firstContext;t!==null;){if(!$n(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function Ms(t){ys=t,la=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function Tn(t){return Fm(ys,t)}function Yl(t,n){return ys===null&&Ms(t),Fm(t,n)}function Fm(t,n){var a=n._currentValue;if(n={context:n,memoizedValue:a,next:null},la===null){if(t===null)throw Error(r(308));la=n,t.dependencies={lanes:0,firstContext:n},t.flags|=524288}else la=la.next=n;return a}var Fy=typeof AbortController<"u"?AbortController:function(){var t=[],n=this.signal={aborted:!1,addEventListener:function(a,s){t.push(s)}};this.abort=function(){n.aborted=!0,t.forEach(function(a){return a()})}},Hy=o.unstable_scheduleCallback,Gy=o.unstable_NormalPriority,un={$$typeof:lt,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function cf(){return{controller:new Fy,data:new Map,refCount:0}}function bo(t){t.refCount--,t.refCount===0&&Hy(Gy,function(){t.controller.abort()})}function Hm(t,n){if((t.pendingLanes&4194048)!==0){var a=t.transitionTypes;for(a===null&&(a=t.transitionTypes=[]),t=0;t<n.length;t++){var s=n[t];a.indexOf(s)===-1&&a.push(s)}}}var Ao=null;function Vy(t){var n=t.transitionTypes;return t.transitionTypes=null,n}var Ro=null,ff=0,Es=0,cr=null;function Xy(t,n){if(Ro===null){var a=Ro=[];ff=0,Es=Rh(),cr={status:"pending",value:void 0,then:function(s){a.push(s)}}}return ff++,n.then(Gm,Gm),n}function Gm(){if(--ff===0&&(Ao=null,Ro!==null)){cr!==null&&(cr.status="fulfilled");var t=Ro;Ro=null,Es=0,cr=null;for(var n=0;n<t.length;n++)(0,t[n])()}}function ky(t,n){var a=[],s={status:"pending",value:null,reason:null,then:function(l){a.push(l)}};return t.then(function(){s.status="fulfilled",s.value=n;for(var l=0;l<a.length;l++)(0,a[l])(n)},function(l){for(s.status="rejected",s.reason=l,l=0;l<a.length;l++)(0,a[l])(void 0)}),s}var Vm=Mt.S;Mt.S=function(t,n){if(Og=G(),typeof n=="object"&&n!==null&&typeof n.then=="function"&&Xy(t,n),Ao!==null)for(var a=Cr;a!==null;)Hm(a,Ao),a=a.next;if(a=t.types,a!==null){for(var s=Cr;s!==null;)Hm(s,a),s=s.next;if(Es!==0){s=Ao,s===null&&(s=Ao=[]);for(var l=0;l<a.length;l++){var c=a[l];s.indexOf(c)===-1&&s.push(c)}}}Vm!==null&&Vm(t,n)};var Ts=Kt(null);function hf(){var t=Ts.current;return t!==null?t:Ye.pooledCache}function ql(t,n){n===null?ne(Ts,Ts.current):ne(Ts,n.pool)}function Xm(){var t=hf();return t===null?null:{parent:un._currentValue,pool:t}}var fr=Error(r(460)),df=Error(r(474)),Wl=Error(r(542)),jl={then:function(){}};function km(t){return t=t.status,t==="fulfilled"||t==="rejected"}function Ym(t,n,a){switch(a=t[a],a===void 0?t.push(n):a!==n&&(n.then(zi,zi),n=a),n.status){case"fulfilled":return n.value;case"rejected":throw t=n.reason,Wm(t),t===void 0&&!("reason"in n)?Error(r(600)):t;default:if(typeof n.status=="string")n.then(zi,zi);else{if(t=Ye,t!==null&&100<t.shellSuspendCounter)throw Error(r(482));t=n,t.status="pending",t.then(function(s){if(n.status==="pending"){var l=n;l.status="fulfilled",l.value=s}},function(s){if(n.status==="pending"){var l=n;l.status="rejected",l.reason=s}})}switch(n.status){case"fulfilled":return n.value;case"rejected":throw t=n.reason,Wm(t),t}throw As=n,fr}}function bs(t){try{var n=t._init;return n(t._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(As=a,fr):a}}var As=null;function qm(){if(As===null)throw Error(r(459));var t=As;return As=null,t}function Wm(t){if(t===fr||t===Wl)throw Error(r(483))}var hr=null,Co=0;function Zl(t){var n=Co;return Co+=1,hr===null&&(hr=[]),Ym(hr,t,n)}function Na(t,n){n=n.props.ref,t.ref=n!==void 0?n:null}function Kl(t,n){throw n.$$typeof===k?Error(r(525)):(t=Object.prototype.toString.call(n),Error(r(31,t==="[object Object]"?"object with keys {"+Object.keys(n).join(", ")+"}":t)))}function jm(t){function n(Y,F){if(t){var Q=Y.deletions;Q===null?(Y.deletions=[F],Y.flags|=16):Q.push(F)}}function a(Y,F){if(!t)return null;for(;F!==null;)n(Y,F),F=F.sibling;return null}function s(Y){for(var F=new Map;Y!==null;)Y.key===null?F.set(Y.index,Y):F.set(Y.key,Y),Y=Y.sibling;return F}function l(Y,F){return Y=ra(Y,F),Y.index=0,Y.sibling=null,Y}function c(Y,F,Q){return Y.index=Q,t?(Q=Y.alternate,Q!==null?(Q=Q.index,Q<F?(Y.flags|=2,F):Q):(Y.flags|=134217730,F)):(Y.flags|=1048576,F)}function p(Y){return t&&Y.alternate===null&&(Y.flags|=134217730),Y}function E(Y,F,Q,ht){return F===null||F.tag!==6?(F=nf(Q,Y.mode,ht),F.return=Y,F):(F=l(F,Q),F.return=Y,F)}function N(Y,F,Q,ht){var Ft=Q.type;return Ft===V?(Y=et(Y,F,Q.props.children,ht,Q.key),Na(Y,Q),Y):F!==null&&(F.elementType===Ft||typeof Ft=="object"&&Ft!==null&&Ft.$$typeof===St&&bs(Ft)===F.type)?(F=l(F,Q.props),Na(F,Q),F.return=Y,F):(F=Fl(Q.type,Q.key,Q.props,null,Y.mode,ht),Na(F,Q),F.return=Y,F)}function q(Y,F,Q,ht){return F===null||F.tag!==4||F.stateNode.containerInfo!==Q.containerInfo||F.stateNode.implementation!==Q.implementation?(F=af(Q,Y.mode,ht),F.return=Y,F):(F=l(F,Q.children||[]),F.return=Y,F)}function et(Y,F,Q,ht,Ft){return F===null||F.tag!==7?(F=vs(Q,Y.mode,ht,Ft),F.return=Y,F):(F=l(F,Q),F.return=Y,F)}function pt(Y,F,Q){if(typeof F=="string"&&F!==""||typeof F=="number"||typeof F=="bigint")return F=nf(""+F,Y.mode,Q),F.return=Y,F;if(typeof F=="object"&&F!==null){switch(F.$$typeof){case w:return Q=Fl(F.type,F.key,F.props,null,Y.mode,Q),Na(Q,F),Q.return=Y,Q;case C:return F=af(F,Y.mode,Q),F.return=Y,F;case St:return F=bs(F),pt(Y,F,Q)}if(At(F)||it(F))return F=vs(F,Y.mode,Q,null),F.return=Y,F;if(typeof F.then=="function")return pt(Y,Zl(F),Q);if(F.$$typeof===lt)return pt(Y,Yl(Y,F),Q);Kl(Y,F)}return null}function X(Y,F,Q,ht){var Ft=F!==null?F.key:null;if(typeof Q=="string"&&Q!==""||typeof Q=="number"||typeof Q=="bigint")return Ft!==null?null:E(Y,F,""+Q,ht);if(typeof Q=="object"&&Q!==null){switch(Q.$$typeof){case w:return Q.key===Ft?N(Y,F,Q,ht):null;case C:return Q.key===Ft?q(Y,F,Q,ht):null;case St:return Q=bs(Q),X(Y,F,Q,ht)}if(At(Q)||it(Q))return Ft!==null?null:et(Y,F,Q,ht,null);if(typeof Q.then=="function")return X(Y,F,Zl(Q),ht);if(Q.$$typeof===lt)return X(Y,F,Yl(Y,Q),ht);Kl(Y,Q)}return null}function $(Y,F,Q,ht,Ft){if(typeof ht=="string"&&ht!==""||typeof ht=="number"||typeof ht=="bigint")return Y=Y.get(Q)||null,E(F,Y,""+ht,Ft);if(typeof ht=="object"&&ht!==null){switch(ht.$$typeof){case w:return Y=Y.get(ht.key===null?Q:ht.key)||null,N(F,Y,ht,Ft);case C:return Y=Y.get(ht.key===null?Q:ht.key)||null,q(F,Y,ht,Ft);case St:return ht=bs(ht),$(Y,F,Q,ht,Ft)}if(At(ht)||it(ht))return Y=Y.get(Q)||null,et(F,Y,ht,Ft,null);if(typeof ht.then=="function")return $(Y,F,Q,Zl(ht),Ft);if(ht.$$typeof===lt)return $(Y,F,Q,Yl(F,ht),Ft);Kl(F,ht)}return null}function Dt(Y,F,Q,ht){for(var Ft=null,Ee=null,Qt=F,ie=F=0,hn=null;Qt!==null&&ie<Q.length;ie++){Qt.index>ie?(hn=Qt,Qt=null):hn=Qt.sibling;var be=X(Y,Qt,Q[ie],ht);if(be===null){Qt===null&&(Qt=hn);break}t&&Qt&&be.alternate===null&&n(Y,Qt),F=c(be,F,ie),Ee===null?Ft=be:Ee.sibling=be,Ee=be,Qt=hn}if(ie===Q.length)return a(Y,Qt),_e&&oa(Y,ie),Ft;if(Qt===null){for(;ie<Q.length;ie++)Qt=pt(Y,Q[ie],ht),Qt!==null&&(F=c(Qt,F,ie),Ee===null?Ft=Qt:Ee.sibling=Qt,Ee=Qt);return _e&&oa(Y,ie),Ft}for(Qt=s(Qt);ie<Q.length;ie++)hn=$(Qt,Y,ie,Q[ie],ht),hn!==null&&(t&&(be=hn.alternate,be!==null&&Qt.delete(be.key===null?ie:be.key)),F=c(hn,F,ie),Ee===null?Ft=hn:Ee.sibling=hn,Ee=hn);return t&&Qt.forEach(function(Qa){return n(Y,Qa)}),_e&&oa(Y,ie),Ft}function kt(Y,F,Q,ht){if(Q==null)throw Error(r(151));for(var Ft=null,Ee=null,Qt=F,ie=F=0,hn=null,be=Q.next();Qt!==null&&!be.done;ie++,be=Q.next()){Qt.index>ie?(hn=Qt,Qt=null):hn=Qt.sibling;var Qa=X(Y,Qt,be.value,ht);if(Qa===null){Qt===null&&(Qt=hn);break}t&&Qt&&Qa.alternate===null&&n(Y,Qt),F=c(Qa,F,ie),Ee===null?Ft=Qa:Ee.sibling=Qa,Ee=Qa,Qt=hn}if(be.done)return a(Y,Qt),_e&&oa(Y,ie),Ft;if(Qt===null){for(;!be.done;ie++,be=Q.next())be=pt(Y,be.value,ht),be!==null&&(F=c(be,F,ie),Ee===null?Ft=be:Ee.sibling=be,Ee=be);return _e&&oa(Y,ie),Ft}for(Qt=s(Qt);!be.done;ie++,be=Q.next())be=$(Qt,Y,ie,be.value,ht),be!==null&&(t&&(hn=be.alternate,hn!==null&&Qt.delete(hn.key===null?ie:hn.key)),F=c(be,F,ie),Ee===null?Ft=be:Ee.sibling=be,Ee=be);return t&&Qt.forEach(function(TM){return n(Y,TM)}),_e&&oa(Y,ie),Ft}function he(Y,F,Q,ht){if(typeof Q=="object"&&Q!==null&&Q.type===V&&Q.key===null&&Q.props.ref===void 0&&(Q=Q.props.children),typeof Q=="object"&&Q!==null){switch(Q.$$typeof){case w:t:{for(var Ft=Q.key;F!==null;){if(F.key===Ft){if(Ft=Q.type,Ft===V){if(F.tag===7){a(Y,F.sibling),ht=l(F,Q.props.children),Na(ht,Q),ht.return=Y,Y=ht;break t}}else if(F.elementType===Ft||typeof Ft=="object"&&Ft!==null&&Ft.$$typeof===St&&bs(Ft)===F.type){a(Y,F.sibling),ht=l(F,Q.props),Na(ht,Q),ht.return=Y,Y=ht;break t}a(Y,F);break}else n(Y,F);F=F.sibling}Q.type===V?(ht=vs(Q.props.children,Y.mode,ht,Q.key),Na(ht,Q),ht.return=Y,Y=ht):(ht=Fl(Q.type,Q.key,Q.props,null,Y.mode,ht),Na(ht,Q),ht.return=Y,Y=ht)}return p(Y);case C:t:{for(Ft=Q.key;F!==null;){if(F.key===Ft)if(F.tag===4&&F.stateNode.containerInfo===Q.containerInfo&&F.stateNode.implementation===Q.implementation){a(Y,F.sibling),ht=l(F,Q.children||[]),ht.return=Y,Y=ht;break t}else{a(Y,F);break}else n(Y,F);F=F.sibling}ht=af(Q,Y.mode,ht),ht.return=Y,Y=ht}return p(Y);case St:return Q=bs(Q),he(Y,F,Q,ht)}if(At(Q))return Dt(Y,F,Q,ht);if(it(Q)){if(Ft=it(Q),typeof Ft!="function")throw Error(r(150));return Q=Ft.call(Q),kt(Y,F,Q,ht)}if(typeof Q.then=="function")return he(Y,F,Zl(Q),ht);if(Q.$$typeof===lt)return he(Y,F,Yl(Y,Q),ht);Kl(Y,Q)}return typeof Q=="string"&&Q!==""||typeof Q=="number"||typeof Q=="bigint"?(Q=""+Q,F!==null&&F.tag===6?(a(Y,F.sibling),ht=l(F,Q),ht.return=Y,Y=ht):(a(Y,F),ht=nf(Q,Y.mode,ht),ht.return=Y,Y=ht),p(Y)):a(Y,F)}return function(Y,F,Q,ht){try{Co=0;var Ft=he(Y,F,Q,ht);return hr=null,Ft}catch(Qt){if(Qt===fr||Qt===Wl)throw Qt;var Ee=kn(29,Qt,null,Y.mode);return Ee.lanes=ht,Ee.return=Y,Ee}}}var Rs=jm(!0),Zm=jm(!1),La=!1;function pf(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function mf(t,n){t=t.updateQueue,n.updateQueue===t&&(n.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function Oa(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function Pa(t,n,a){var s=t.updateQueue;if(s===null)return null;if(s=s.shared,(Le&2)!==0){var l=s.pending;return l===null?n.next=n:(n.next=l.next,l.next=n),s.pending=n,n=Bl(t),Nm(t,null,a),n}return Il(t,s,n,a),Bl(t)}function wo(t,n,a){if(n=n.updateQueue,n!==null&&(n=n.shared,(a&4194048)!==0)){var s=n.lanes;s&=t.pendingLanes,a|=s,n.lanes=a,j(t,a)}}function _f(t,n){var a=t.updateQueue,s=t.alternate;if(s!==null&&(s=s.updateQueue,a===s)){var l=null,c=null;if(a=a.firstBaseUpdate,a!==null){do{var p={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};c===null?l=c=p:c=c.next=p,a=a.next}while(a!==null);c===null?l=c=n:c=c.next=n}else l=c=n;a={baseState:s.baseState,firstBaseUpdate:l,lastBaseUpdate:c,shared:s.shared,callbacks:s.callbacks},t.updateQueue=a;return}t=a.lastBaseUpdate,t===null?a.firstBaseUpdate=n:t.next=n,a.lastBaseUpdate=n}var gf=!1;function Do(){if(gf){var t=cr;if(t!==null)throw t}}function Uo(t,n,a,s){gf=!1;var l=t.updateQueue;La=!1;var c=l.firstBaseUpdate,p=l.lastBaseUpdate,E=l.shared.pending;if(E!==null){l.shared.pending=null;var N=E,q=N.next;N.next=null,p===null?c=q:p.next=q,p=N;var et=t.alternate;et!==null&&(et=et.updateQueue,E=et.lastBaseUpdate,E!==p&&(E===null?et.firstBaseUpdate=q:E.next=q,et.lastBaseUpdate=N))}if(c!==null){var pt=l.baseState;p=0,et=q=N=null,E=c;do{var X=E.lane&-536870913,$=X!==E.lane;if($?(Me&X)===X:(s&X)===X){X!==0&&X===Es&&(gf=!0),et!==null&&(et=et.next={lane:0,tag:E.tag,payload:E.payload,callback:null,next:null});t:{var Dt=t,kt=E;X=n;var he=a;switch(kt.tag){case 1:if(Dt=kt.payload,typeof Dt=="function"){pt=Dt.call(he,pt,X);break t}pt=Dt;break t;case 3:Dt.flags=Dt.flags&-65537|128;case 0:if(Dt=kt.payload,X=typeof Dt=="function"?Dt.call(he,pt,X):Dt,X==null)break t;pt=O({},pt,X);break t;case 2:La=!0}}X=E.callback,X!==null&&(t.flags|=64,$&&(t.flags|=8192),$=l.callbacks,$===null?l.callbacks=[X]:$.push(X))}else $={lane:X,tag:E.tag,payload:E.payload,callback:E.callback,next:null},et===null?(q=et=$,N=pt):et=et.next=$,p|=X;if(E=E.next,E===null){if(E=l.shared.pending,E===null)break;$=E,E=$.next,$.next=null,l.lastBaseUpdate=$,l.shared.pending=null}}while(!0);et===null&&(N=pt),l.baseState=N,l.firstBaseUpdate=q,l.lastBaseUpdate=et,c===null&&(l.shared.lanes=0),Va|=p,t.lanes=p,t.memoizedState=pt}}function Km(t,n){if(typeof t!="function")throw Error(r(191,t));t.call(n)}function Qm(t,n){var a=t.callbacks;if(a!==null)for(t.callbacks=null,t=0;t<a.length;t++)Km(a[t],n)}var za=Kt(null),Ql=Kt(0);function Jm(t,n){t=pa,ne(Ql,t),ne(za,n),pa=t|n.baseLanes}function vf(){ne(Ql,pa),ne(za,za.current)}function Sf(){pa=Ql.current,Nt(za),Nt(Ql)}var bn=Kt(null),Ln=null;function Ia(t){var n=t.alternate;ne(An,An.current&1),ne(bn,t),Ln===null&&(n===null||za.current!==null||n.memoizedState!==null)&&(Ln=t)}function yf(t){ne(An,An.current),ne(bn,t),Ln===null&&(Ln=t)}function $m(t){t.tag===22?(ne(An,An.current),ne(bn,t),Ln===null&&(Ln=t)):Ba()}function Ba(){ne(An,An.current),ne(bn,bn.current)}function ti(t){Nt(bn),Ln===t&&(Ln=null),Nt(An)}var An=Kt(0);function No(t,n){ne(bn,bn.current),ne(An,n)}function xf(t){Nt(An),Nt(bn),Ln===t&&(Ln=null)}function Jl(t){for(var n=t;n!==null;){if(n.tag===13){var a=n.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Xh(a)||kh(a)))return n}else if(n.tag===19&&n.memoizedProps.revealOrder!=="independent"){if((n.flags&128)!==0)return n}else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return null;n=n.return}n.sibling.return=n.return,n=n.sibling}return null}var ca=0,fe=null,Ge=null,cn=null,$l=!1,dr=!1,Cs=!1,tu=0,Lo=0,pr=null,Yy=0;function nn(){throw Error(r(321))}function Mf(t,n){if(n===null)return!1;for(var a=0;a<n.length&&a<t.length;a++)if(!$n(t[a],n[a]))return!1;return!0}function Ef(t,n,a,s,l,c){return ca=c,fe=n,n.memoizedState=null,n.updateQueue=null,n.lanes=0,Mt.H=t===null||t.memoizedState===null?z_:I_,Cs=!1,c=a(s,l),Cs=!1,dr&&(c=e_(n,a,s,l)),t_(t),c}function t_(t){Mt.H=ou;var n=Ge!==null&&Ge.next!==null;if(ca=0,cn=Ge=fe=null,$l=!1,Lo=0,pr=null,n)throw Error(r(300));t===null||fn||(t=t.dependencies,t!==null&&kl(t)&&(fn=!0))}function e_(t,n,a,s){fe=t;var l=0;do{if(dr&&(pr=null),Lo=0,dr=!1,25<=l)throw Error(r(301));if(l+=1,cn=Ge=null,t.updateQueue!=null){var c=t.updateQueue;c.lastEffect=null,c.events=null,c.stores=null,c.memoCache!=null&&(c.memoCache.index=0)}Mt.H=$y,c=n(a,s)}while(dr);return c}function qy(){var t=Mt.H,n=t.useState()[0];return n=typeof n.then=="function"?Oo(n):n,t=t.useState()[0],(Ge!==null?Ge.memoizedState:null)!==t&&(fe.flags|=1024),n}function Tf(){var t=tu!==0;return tu=0,t}function bf(t,n,a){n.updateQueue=t.updateQueue,n.flags&=-2053,t.lanes&=~a}function Af(t){if($l){for(t=t.memoizedState;t!==null;){var n=t.queue;n!==null&&(n.pending=null),t=t.next}$l=!1}ca=0,cn=Ge=fe=null,dr=!1,Lo=tu=0,pr=null}function Bn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return cn===null?fe.memoizedState=cn=t:cn=cn.next=t,cn}function rn(){if(Ge===null){var t=fe.alternate;t=t!==null?t.memoizedState:null}else t=Ge.next;var n=cn===null?fe.memoizedState:cn.next;if(n!==null)cn=n,Ge=t;else{if(t===null)throw fe.alternate===null?Error(r(467)):Error(r(310));Ge=t,t={memoizedState:Ge.memoizedState,baseState:Ge.baseState,baseQueue:Ge.baseQueue,queue:Ge.queue,next:null},cn===null?fe.memoizedState=cn=t:cn=cn.next=t}return cn}function eu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Oo(t){var n=Lo;return Lo+=1,pr===null&&(pr=[]),t=Ym(pr,t,n),n=fe,(cn===null?n.memoizedState:cn.next)===null&&(n=n.alternate,Mt.H=n===null||n.memoizedState===null?z_:I_),t}function nu(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return Oo(t);if(t.$$typeof===ct)return;if(t.$$typeof===lt)return Tn(t)}throw Error(r(438,String(t)))}function Rf(t){var n=null,a=fe.updateQueue;if(a!==null&&(n=a.memoCache),n==null){var s=fe.alternate;s!==null&&(s=s.updateQueue,s!==null&&(s=s.memoCache,s!=null&&(n={data:s.data.map(function(l){return l.slice()}),index:0})))}if(n==null&&(n={data:[],index:0}),a===null&&(a=eu(),fe.updateQueue=a),a.memoCache=n,a=n.data[n.index],a===void 0)for(a=n.data[n.index]=Array(t),s=0;s<t;s++)a[s]=Te;return n.index++,a}function fa(t,n){return typeof n=="function"?n(t):n}function iu(t){var n=rn();return Cf(n,Ge,t)}function Cf(t,n,a){var s=t.queue;if(s===null)throw Error(r(311));s.lastRenderedReducer=a;var l=t.baseQueue,c=s.pending;if(c!==null){if(l!==null){var p=l.next;l.next=c.next,c.next=p}n.baseQueue=l=c,s.pending=null}if(c=t.baseState,l===null)t.memoizedState=c;else{n=l.next;var E=p=null,N=null,q=n,et=!1;do{var pt=q.lane&-536870913;if(pt!==q.lane?(Me&pt)===pt:(ca&pt)===pt){var X=q.revertLane;if(X===0)N!==null&&(N=N.next={lane:0,revertLane:0,gesture:null,action:q.action,hasEagerState:q.hasEagerState,eagerState:q.eagerState,next:null}),pt===Es&&(et=!0);else if((ca&X)===X){q=q.next,X===Es&&(et=!0);continue}else pt={lane:0,revertLane:q.revertLane,gesture:null,action:q.action,hasEagerState:q.hasEagerState,eagerState:q.eagerState,next:null},N===null?(E=N=pt,p=c):N=N.next=pt,fe.lanes|=X,Va|=X;pt=q.action,Cs&&a(c,pt),c=q.hasEagerState?q.eagerState:a(c,pt)}else X={lane:pt,revertLane:q.revertLane,gesture:q.gesture,action:q.action,hasEagerState:q.hasEagerState,eagerState:q.eagerState,next:null},N===null?(E=N=X,p=c):N=N.next=X,fe.lanes|=pt,Va|=pt;q=q.next}while(q!==null&&q!==n);if(N===null?p=c:N.next=E,!$n(c,t.memoizedState)&&(fn=!0,et&&(a=cr,a!==null)))throw a;t.memoizedState=c,t.baseState=p,t.baseQueue=N,s.lastRenderedState=c}return l===null&&(s.lanes=0),[t.memoizedState,s.dispatch]}function wf(t){var n=rn(),a=n.queue;if(a===null)throw Error(r(311));a.lastRenderedReducer=t;var s=a.dispatch,l=a.pending,c=n.memoizedState;if(l!==null){a.pending=null;var p=l=l.next;do c=t(c,p.action),p=p.next;while(p!==l);$n(c,n.memoizedState)||(fn=!0),n.memoizedState=c,n.baseQueue===null&&(n.baseState=c),a.lastRenderedState=c}return[c,s]}function n_(t,n,a){var s=fe,l=rn(),c=_e;if(c){if(a===void 0)throw Error(r(407));a=a()}else a=n();var p=!$n((Ge||l).memoizedState,a);if(p&&(l.memoizedState=a,fn=!0),l=l.queue,Nf(s_.bind(null,s,l,t),[t]),t=l.getSnapshot!==n||p||cn!==null&&(cn.memoizedState.tag&1)!==0,mr(t?9:8,{destroy:void 0},a_.bind(null,s,l,a,n),null),t){if(s.flags|=2048,Ye===null)throw Error(r(349));c||(ca&127)!==0||i_(s,n,a)}return a}function i_(t,n,a){t.flags|=16384,t={getSnapshot:n,value:a},n=fe.updateQueue,n===null?(n=eu(),fe.updateQueue=n,n.stores=[t]):(a=n.stores,a===null?n.stores=[t]:a.push(t))}function a_(t,n,a,s){n.value=a,n.getSnapshot=s,r_(n)&&o_(t)}function s_(t,n,a){return a(function(){r_(n)&&o_(t)})}function r_(t){var n=t.getSnapshot;t=t.value;try{var a=n();return!$n(t,a)}catch{return!0}}function o_(t){var n=gs(t,2);n!==null&&jn(n,t,2)}function Df(t){var n=Bn();if(typeof t=="function"){var a=t;if(t=a(),Cs){pn(!0);try{a()}finally{pn(!1)}}}return n.memoizedState=n.baseState=t,n.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:fa,lastRenderedState:t},n}function l_(t,n,a,s){return t.baseState=a,Cf(t,Ge,typeof s=="function"?s:fa)}function Wy(t,n,a,s,l){if(ru(t))throw Error(r(485));if(t=n.action,t!==null){var c={payload:l,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(p){c.listeners.push(p)}};Mt.T!==null?a(!0):c.isTransition=!1,s(c),a=n.pending,a===null?(c.next=n.pending=c,u_(n,c)):(c.next=a.next,n.pending=a.next=c)}}function u_(t,n){var a=n.action,s=n.payload,l=t.state;if(n.isTransition){var c=Mt.T,p={};p.types=c!==null?c.types:null,Mt.T=p;try{var E=a(l,s),N=Mt.S;N!==null&&N(p,E),c_(t,n,E)}catch(q){Uf(t,n,q)}finally{c!==null&&p.types!==null&&(c.types=p.types),Mt.T=c}}else try{c=a(l,s),c_(t,n,c)}catch(q){Uf(t,n,q)}}function c_(t,n,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(s){f_(t,n,s)},function(s){return Uf(t,n,s)}):f_(t,n,a)}function f_(t,n,a){n.status="fulfilled",n.value=a,h_(n),t.state=a,n=t.pending,n!==null&&(a=n.next,a===n?t.pending=null:(a=a.next,n.next=a,u_(t,a)))}function Uf(t,n,a){var s=t.pending;if(t.pending=null,s!==null){s=s.next;do n.status="rejected",n.reason=a,h_(n),n=n.next;while(n!==s)}t.action=null}function h_(t){t=t.listeners;for(var n=0;n<t.length;n++)(0,t[n])()}function d_(t,n){return n}function p_(t,n){if(_e){var a=Ye.formState;if(a!==null){t:{var s=fe;if(_e){if(je){e:{for(var l=je,c=_i;l.nodeType!==8;){if(!c){l=null;break e}if(l=vi(l.nextSibling),l===null){l=null;break e}}c=l.data,l=c==="F!"||c==="F"?l:null}if(l){je=vi(l.nextSibling),s=l.data==="F!";break t}}Da(s)}s=!1}s&&(n=a[0])}}return a=Bn(),a.memoizedState=a.baseState=n,s={pending:null,lanes:0,dispatch:null,lastRenderedReducer:d_,lastRenderedState:n},a.queue=s,a=L_.bind(null,fe,s),s.dispatch=a,s=Df(!1),c=If.bind(null,fe,!1,s.queue),s=Bn(),l={state:n,dispatch:null,action:t,pending:null},s.queue=l,a=Wy.bind(null,fe,l,c,a),l.dispatch=a,s.memoizedState=t,[n,a,!1]}function m_(t){var n=rn();return __(n,Ge,t)}function __(t,n,a){if(n=Cf(t,n,d_)[0],t=iu(fa)[0],typeof n=="object"&&n!==null&&typeof n.then=="function")try{var s=Oo(n)}catch(p){throw p===fr?Wl:p}else s=n;n=rn();var l=n.queue,c=l.dispatch;return a!==n.memoizedState&&(fe.flags|=2048,mr(9,{destroy:void 0},jy.bind(null,l,a),null)),[s,c,t]}function jy(t,n){t.action=n}function g_(t){var n=rn(),a=Ge;if(a!==null)return __(n,a,t);rn(),n=n.memoizedState,a=rn();var s=a.queue.dispatch;return a.memoizedState=t,[n,s,!1]}function mr(t,n,a,s){return t={tag:t,create:a,deps:s,inst:n,next:null},n=fe.updateQueue,n===null&&(n=eu(),fe.updateQueue=n),a=n.lastEffect,a===null?n.lastEffect=t.next=t:(s=a.next,a.next=t,t.next=s,n.lastEffect=t),t}function v_(){return rn().memoizedState}function au(t,n,a,s){var l=Bn();fe.flags|=t,l.memoizedState=mr(1|n,{destroy:void 0},a,s===void 0?null:s)}function su(t,n,a,s){var l=rn();s=s===void 0?null:s;var c=l.memoizedState.inst;Ge!==null&&s!==null&&Mf(s,Ge.memoizedState.deps)?l.memoizedState=mr(n,c,a,s):(fe.flags|=t,l.memoizedState=mr(1|n,c,a,s))}function S_(t,n){au(8390656,8,t,n)}function Nf(t,n){su(2048,8,t,n)}function Zy(t){fe.flags|=4;var n=fe.updateQueue;if(n===null)n=eu(),fe.updateQueue=n,n.events=[t];else{var a=n.events;a===null?n.events=[t]:a.push(t)}}function y_(t){var n=rn().memoizedState;return Zy({ref:n,nextImpl:t}),function(){if((Le&2)!==0)throw Error(r(440));return n.impl.apply(void 0,arguments)}}function x_(t,n){return su(4,2,t,n)}function M_(t,n){return su(4,4,t,n)}function E_(t,n){if(typeof n=="function"){t=t();var a=n(t);return function(){typeof a=="function"?a():n(null)}}if(n!=null)return t=t(),n.current=t,function(){n.current=null}}function T_(t,n,a){a=a!=null?a.concat([t]):null,su(4,4,E_.bind(null,n,t),a)}function Lf(){}function b_(t,n){var a=rn();n=n===void 0?null:n;var s=a.memoizedState;return n!==null&&Mf(n,s[1])?s[0]:(a.memoizedState=[t,n],t)}function A_(t,n){var a=rn();n=n===void 0?null:n;var s=a.memoizedState;if(n!==null&&Mf(n,s[1]))return s[0];if(s=t(),Cs){pn(!0);try{t()}finally{pn(!1)}}return a.memoizedState=[s,n],s}function Of(t,n,a){return a===void 0||(ca&1073741824)!==0&&(Me&261930)===0?t.memoizedState=n:(t.memoizedState=a,t=zg(),fe.lanes|=t,Va|=t,a)}function R_(t,n,a,s){return $n(a,n)?a:za.current!==null?(t=Of(t,a,s),$n(t,n)||(fn=!0),t):(ca&106)===0||(ca&1073741824)!==0&&(Me&261930)===0?(fn=!0,t.memoizedState=a):(t=zg(),fe.lanes|=t,Va|=t,n)}function C_(t,n,a,s,l){var c=Yt.p;Yt.p=c!==0&&8>c?c:8;var p=Mt.T,E={};E.types=p!==null?p.types:null,Mt.T=E,If(t,!1,n,a);try{var N=l(),q=Mt.S;if(q!==null&&q(E,N),N!==null&&typeof N=="object"&&typeof N.then=="function"){var et=ky(N,s);Po(t,n,et,ai(t))}else Po(t,n,s,ai(t))}catch(pt){Po(t,n,{then:function(){},status:"rejected",reason:pt},ai())}finally{Yt.p=c,p!==null&&E.types!==null&&(p.types=E.types),Mt.T=p}}function Ky(){}function Pf(t,n,a,s){if(t.tag!==5)throw Error(r(476));var l=w_(t).queue;C_(t,l,n,L,a===null?Ky:function(){return D_(t),a(s)})}function w_(t){var n=t.memoizedState;if(n!==null)return n;n={memoizedState:L,baseState:L,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:fa,lastRenderedState:L},next:null};var a={};return n.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:fa,lastRenderedState:a},next:null},t.memoizedState=n,t=t.alternate,t!==null&&(t.memoizedState=n),n}function D_(t){var n=w_(t);n.next===null&&(n=t.alternate.memoizedState),Po(t,n.next.queue,{},ai())}function zf(){return Tn(Or)}function U_(){return rn().memoizedState}function N_(){return rn().memoizedState}function Qy(t){for(var n=t.return;n!==null;){switch(n.tag){case 24:case 3:var a=ai();t=Oa(a);var s=Pa(n,t,a);s!==null&&(jn(s,n,a),wo(s,n,a)),n={cache:cf()},t.payload=n;return}n=n.return}}function Jy(t,n,a){var s=ai();a={lane:s,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},ru(t)?O_(n,a):(a=tf(t,n,a,s),a!==null&&(jn(a,t,s),P_(a,n,s)))}function L_(t,n,a){var s=ai();Po(t,n,a,s)}function Po(t,n,a,s){var l={lane:s,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(ru(t))O_(n,l);else{var c=t.alternate;if(t.lanes===0&&(c===null||c.lanes===0)&&(c=n.lastRenderedReducer,c!==null))try{var p=n.lastRenderedState,E=c(p,a);if(l.hasEagerState=!0,l.eagerState=E,$n(E,p))return Il(t,n,l,0),Ye===null&&zl(),!1}catch{}if(a=tf(t,n,l,s),a!==null)return jn(a,t,s),P_(a,n,s),!0}return!1}function If(t,n,a,s){if(s={lane:2,revertLane:Rh(),gesture:null,action:s,hasEagerState:!1,eagerState:null,next:null},ru(t)){if(n)throw Error(r(479))}else n=tf(t,a,s,2),n!==null&&jn(n,t,2)}function ru(t){var n=t.alternate;return t===fe||n!==null&&n===fe}function O_(t,n){dr=$l=!0;var a=t.pending;a===null?n.next=n:(n.next=a.next,a.next=n),t.pending=n}function P_(t,n,a){if((a&4194048)!==0){var s=n.lanes;s&=t.pendingLanes,a|=s,n.lanes=a,j(t,a)}}var ou={readContext:Tn,use:nu,useCallback:nn,useContext:nn,useEffect:nn,useImperativeHandle:nn,useLayoutEffect:nn,useInsertionEffect:nn,useMemo:nn,useReducer:nn,useRef:nn,useState:nn,useDebugValue:nn,useDeferredValue:nn,useTransition:nn,useSyncExternalStore:nn,useId:nn,useHostTransitionStatus:nn,useFormState:nn,useActionState:nn,useOptimistic:nn,useMemoCache:nn,useCacheRefresh:nn,useEffectEvent:nn},z_={readContext:Tn,use:nu,useCallback:function(t,n){return Bn().memoizedState=[t,n===void 0?null:n],t},useContext:Tn,useEffect:S_,useImperativeHandle:function(t,n,a){a=a!=null?a.concat([t]):null,au(4194308,4,E_.bind(null,n,t),a)},useLayoutEffect:function(t,n){return au(4194308,4,t,n)},useInsertionEffect:function(t,n){au(4,2,t,n)},useMemo:function(t,n){var a=Bn();n=n===void 0?null:n;var s=t();if(Cs){pn(!0);try{t()}finally{pn(!1)}}return a.memoizedState=[s,n],s},useReducer:function(t,n,a){var s=Bn();if(a!==void 0){var l=a(n);if(Cs){pn(!0);try{a(n)}finally{pn(!1)}}}else l=n;return s.memoizedState=s.baseState=l,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:l},s.queue=t,t=t.dispatch=Jy.bind(null,fe,t),[s.memoizedState,t]},useRef:function(t){var n=Bn();return t={current:t},n.memoizedState=t},useState:function(t){t=Df(t);var n=t.queue,a=L_.bind(null,fe,n);return n.dispatch=a,[t.memoizedState,a]},useDebugValue:Lf,useDeferredValue:function(t,n){var a=Bn();return Of(a,t,n)},useTransition:function(){var t=Df(!1);return t=C_.bind(null,fe,t.queue,!0,!1),Bn().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,n,a){var s=fe,l=Bn();if(_e){if(a===void 0)throw Error(r(407));a=a()}else{if(a=n(),Ye===null)throw Error(r(349));(Me&127)!==0||i_(s,n,a)}l.memoizedState=a;var c={value:a,getSnapshot:n};return l.queue=c,S_(s_.bind(null,s,c,t),[t]),s.flags|=2048,mr(9,{destroy:void 0},a_.bind(null,s,c,a,n),null),a},useId:function(){var t=Bn(),n=Ye.identifierPrefix;if(_e){var a=Bi,s=Ii;a=(s&~(1<<32-Un(s)-1)).toString(32)+a,n="_"+n+"R_"+a,a=tu++,0<a&&(n+="H"+a.toString(32)),n+="_"}else a=Yy++,n="_"+n+"r_"+a.toString(32)+"_";return t.memoizedState=n},useHostTransitionStatus:zf,useFormState:p_,useActionState:p_,useOptimistic:function(t){var n=Bn();n.memoizedState=n.baseState=t;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return n.queue=a,n=If.bind(null,fe,!0,a),a.dispatch=n,[t,n]},useMemoCache:Rf,useCacheRefresh:function(){return Bn().memoizedState=Qy.bind(null,fe)},useEffectEvent:function(t){var n=Bn(),a={impl:t};return n.memoizedState=a,function(){if((Le&2)!==0)throw Error(r(440));return a.impl.apply(void 0,arguments)}}},I_={readContext:Tn,use:nu,useCallback:b_,useContext:Tn,useEffect:Nf,useImperativeHandle:T_,useInsertionEffect:x_,useLayoutEffect:M_,useMemo:A_,useReducer:iu,useRef:v_,useState:function(){return iu(fa)},useDebugValue:Lf,useDeferredValue:function(t,n){var a=rn();return R_(a,Ge.memoizedState,t,n)},useTransition:function(){var t=iu(fa)[0],n=rn().memoizedState;return[typeof t=="boolean"?t:Oo(t),n]},useSyncExternalStore:n_,useId:U_,useHostTransitionStatus:zf,useFormState:m_,useActionState:m_,useOptimistic:function(t,n){var a=rn();return l_(a,Ge,t,n)},useMemoCache:Rf,useCacheRefresh:N_,useEffectEvent:y_},$y={readContext:Tn,use:nu,useCallback:b_,useContext:Tn,useEffect:Nf,useImperativeHandle:T_,useInsertionEffect:x_,useLayoutEffect:M_,useMemo:A_,useReducer:wf,useRef:v_,useState:function(){return wf(fa)},useDebugValue:Lf,useDeferredValue:function(t,n){var a=rn();return Ge===null?Of(a,t,n):R_(a,Ge.memoizedState,t,n)},useTransition:function(){var t=wf(fa)[0],n=rn().memoizedState;return[typeof t=="boolean"?t:Oo(t),n]},useSyncExternalStore:n_,useId:U_,useHostTransitionStatus:zf,useFormState:g_,useActionState:g_,useOptimistic:function(t,n){var a=rn();return Ge!==null?l_(a,Ge,t,n):(a.baseState=t,[t,a.queue.dispatch])},useMemoCache:Rf,useCacheRefresh:N_,useEffectEvent:y_};function Bf(t,n,a,s){n=t.memoizedState,a=a(s,n),a=a==null?n:O({},n,a),t.memoizedState=a,t.lanes===0&&(t.updateQueue.baseState=a)}var Ff={enqueueSetState:function(t,n,a){t=t._reactInternals;var s=ai(),l=Oa(s);l.payload=n,a!=null&&(l.callback=a),n=Pa(t,l,s),n!==null&&(jn(n,t,s),wo(n,t,s))},enqueueReplaceState:function(t,n,a){t=t._reactInternals;var s=ai(),l=Oa(s);l.tag=1,l.payload=n,a!=null&&(l.callback=a),n=Pa(t,l,s),n!==null&&(jn(n,t,s),wo(n,t,s))},enqueueForceUpdate:function(t,n){t=t._reactInternals;var a=ai(),s=Oa(a);s.tag=2,n!=null&&(s.callback=n),n=Pa(t,s,a),n!==null&&(jn(n,t,a),wo(n,t,a))}};function B_(t,n,a,s,l,c,p){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(s,c,p):n.prototype&&n.prototype.isPureReactComponent?!xo(a,s)||!xo(l,c):!0}function F_(t,n,a,s){t=n.state,typeof n.componentWillReceiveProps=="function"&&n.componentWillReceiveProps(a,s),typeof n.UNSAFE_componentWillReceiveProps=="function"&&n.UNSAFE_componentWillReceiveProps(a,s),n.state!==t&&Ff.enqueueReplaceState(n,n.state,null)}function ws(t,n){var a=n;if("ref"in n){a={};for(var s in n)s!=="ref"&&(a[s]=n[s])}if(t=t.defaultProps){a===n&&(a=O({},a));for(var l in t)a[l]===void 0&&(a[l]=t[l])}return a}function H_(t){Pl(t)}function G_(t){console.error(t)}function V_(t){Pl(t)}function lu(t,n){try{var a=t.onUncaughtError;a(n.value,{componentStack:n.stack})}catch(s){setTimeout(function(){throw s})}}function X_(t,n,a){try{var s=t.onCaughtError;s(a.value,{componentStack:a.stack,errorBoundary:n.tag===1?n.stateNode:null})}catch(l){setTimeout(function(){throw l})}}function Hf(t,n,a){return a=Oa(a),a.tag=3,a.payload={element:null},a.callback=function(){lu(t,n)},a}function k_(t){return t=Oa(t),t.tag=3,t}function Y_(t,n,a,s){var l=a.type.getDerivedStateFromError;if(typeof l=="function"){var c=s.value;t.payload=function(){return l(c)},t.callback=function(){X_(n,a,s)}}var p=a.stateNode;p!==null&&typeof p.componentDidCatch=="function"&&(t.callback=function(){X_(n,a,s),typeof l!="function"&&(Xa===null?Xa=new Set([this]):Xa.add(this));var E=s.stack;this.componentDidCatch(s.value,{componentStack:E!==null?E:""})})}function tx(t,n,a,s,l){if(a.flags|=32768,s!==null&&typeof s=="object"&&typeof s.then=="function"){if(n=a.alternate,n!==null&&xs(n,a,l,!0),a=bn.current,a!==null){switch(a.tag){case 31:case 13:case 19:return Ln===null?wu():a.alternate===null&&an===0&&(an=3),a.flags&=-257,a.flags|=65536,a.lanes=l,s===jl?a.flags|=16384:(n=a.updateQueue,n===null?a.updateQueue=new Set([s]):n.add(s),Th(t,s,l)),!1;case 22:return a.flags|=65536,s===jl?a.flags|=16384:(n=a.updateQueue,n===null?(n={transitions:null,markerInstances:null,retryQueue:new Set([s])},a.updateQueue=n):(a=n.retryQueue,a===null?n.retryQueue=new Set([s]):a.add(s)),Th(t,s,l)),!1}throw Error(r(435,a.tag))}return Th(t,s,l),wu(),!1}if(_e)return n=bn.current,n!==null?((n.flags&65536)===0&&(n.flags|=256),n.flags|=65536,n.lanes=l,s!==rf&&(t=Error(r(422),{cause:s}),To(di(t,a)))):(s!==rf&&(n=Error(r(423),{cause:s}),To(di(n,a))),t=t.current.alternate,t.flags|=65536,l&=-l,t.lanes|=l,s=di(s,a),l=Hf(t.stateNode,s,l),_f(t,l),an!==4&&(an=2)),!1;var c=Error(r(520),{cause:s});if(c=di(c,a),Xo===null?Xo=[c]:Xo.push(c),an!==4&&(an=2),n===null)return!0;s=di(s,a),a=n;do{switch(a.tag){case 3:return a.flags|=65536,t=l&-l,a.lanes|=t,t=Hf(a.stateNode,s,t),_f(a,t),!1;case 1:if(n=a.type,c=a.stateNode,(a.flags&128)===0&&(typeof n.getDerivedStateFromError=="function"||c!==null&&typeof c.componentDidCatch=="function"&&(Xa===null||!Xa.has(c))))return a.flags|=65536,l&=-l,a.lanes|=l,l=k_(l),Y_(l,t,a,s),_f(a,l),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var Gf=Error(r(461)),fn=!1;function _n(t,n,a,s){n.child=t===null?Zm(n,null,a,s):Rs(n,t.child,a,s)}function q_(t,n,a,s,l){a=a.render;var c=n.ref;if("ref"in s){var p={};for(var E in s)E!=="ref"&&(p[E]=s[E])}else p=s;return Ms(n),s=Ef(t,n,a,p,c,l),E=Tf(),t!==null&&!fn?(bf(t,n,l),ha(t,n,l)):(_e&&E&&Gl(n),n.flags|=1,_n(t,n,s,l),n.child)}function W_(t,n,a,s,l){if(t===null){var c=a.type;return typeof c=="function"&&!ef(c)&&c.defaultProps===void 0&&a.compare===null?(n.tag=15,n.type=c,j_(t,n,c,s,l)):(t=Fl(a.type,null,s,n,n.mode,l),t.ref=n.ref,t.return=n,n.child=t)}if(c=t.child,!Zf(t,l)){var p=c.memoizedProps;if(a=a.compare,a=a!==null?a:xo,a(p,s)&&t.ref===n.ref)return ha(t,n,l)}return n.flags|=1,t=ra(c,s),t.ref=n.ref,t.return=n,n.child=t}function j_(t,n,a,s,l){if(t!==null){var c=t.memoizedProps;if(xo(c,s)&&t.ref===n.ref)if(fn=!1,n.pendingProps=s=c,Zf(t,l))(t.flags&131072)!==0&&(fn=!0);else return n.lanes=t.lanes,ha(t,n,l)}return Vf(t,n,a,s,l)}function Z_(t,n,a,s){var l=s.children,c=t!==null?t.memoizedState:null;if(t===null&&n.stateNode===null&&(n.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),s.mode==="hidden"){if((n.flags&128)!==0){if(c=c!==null?c.baseLanes|a:a,t!==null){for(s=n.child=t.child,l=0;s!==null;)l=l|s.lanes|s.childLanes,s=s.sibling;s=l&~c}else s=0,n.child=null;return K_(t,n,c,a,s)}if((a&536870912)!==0)n.memoizedState={baseLanes:0,cachePool:null},t!==null&&ql(n,c!==null?c.cachePool:null),c!==null?Jm(n,c):vf(),$m(n);else return s=n.lanes=536870912,K_(t,n,c!==null?c.baseLanes|a:a,a,s)}else c!==null?(ql(n,c.cachePool),Jm(n,c),Ba(),n.memoizedState=null):(t!==null&&ql(n,null),vf(),Ba());return _n(t,n,l,a),n.child}function zo(t,n){return t!==null&&t.tag===22||n.stateNode!==null||(n.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.sibling}function K_(t,n,a,s,l){var c=hf();return c=c===null?null:{parent:un._currentValue,pool:c},n.memoizedState={baseLanes:a,cachePool:c},t!==null&&ql(n,null),vf(),$m(n),t!==null&&xs(t,n,s,!0),n.childLanes=l,null}function uu(t,n){return n=cu({mode:n.mode,children:n.children},t.mode),n.ref=t.ref,t.child=n,n.return=t,n}function Q_(t,n,a){return Rs(n,t.child,null,a),t=uu(n,n.pendingProps),t.flags|=2,ti(n),n.memoizedState=null,t}function ex(t,n,a){var s=n.pendingProps,l=(n.flags&128)!==0;if(n.flags&=-129,t===null){if(_e){if(s.mode==="hidden")return t=uu(n,s),n.lanes=536870912,t.memoizedState={baseLanes:0,cachePool:null},zo(null,t);if(yf(n),(t=je)?(t=E0(t,_i),t=t!==null&&t.data==="&"?t:null,t!==null&&(n.memoizedState={dehydrated:t,treeContext:Ca!==null?{id:Ii,overflow:Bi}:null,retryLane:536870912,hydrationErrors:null},a=Om(t),a.return=n,n.child=a,yn=n,je=null)):t=null,t===null)throw Da(n);return n.lanes=536870912,null}return uu(n,s)}var c=t.memoizedState;if(c!==null){var p=c.dehydrated;if(yf(n),l)if(n.flags&256)n.flags&=-257,n=Q_(t,n,a);else if(n.memoizedState!==null)n.child=t.child,n.flags|=128,n=null;else throw Error(r(558));else if(fn||xs(t,n,a,!1),l=(a&t.childLanes)!==0,fn||l){if(za.current===null){if(s=Ye,s!==null&&(p=rt(s,a),p!==0&&p!==c.retryLane))throw c.retryLane=p,gs(t,p),jn(s,t,p),Gf;wu()}n=Q_(t,n,a)}else t=c.treeContext,je=vi(p.nextSibling),yn=n,_e=!0,wa=null,_i=!1,t!==null&&Im(n,t),n=uu(n,s),n.flags|=134221824;return n}return t=ra(t.child,{mode:s.mode,children:s.children}),t.ref=n.ref,n.child=t,t.return=n,t}function _r(t,n){var a=n.ref;if(a===null)t!==null&&t.ref!==null&&(n.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(r(284));(t===null||t.ref!==a)&&(n.flags|=4194816)}}function Vf(t,n,a,s,l){return Ms(n),a=Ef(t,n,a,s,void 0,l),s=Tf(),t!==null&&!fn?(bf(t,n,l),ha(t,n,l)):(_e&&s&&Gl(n),n.flags|=1,_n(t,n,a,l),n.child)}function J_(t,n,a,s,l,c){return Ms(n),n.updateQueue=null,a=e_(n,s,a,l),t_(t),s=Tf(),t!==null&&!fn?(bf(t,n,c),ha(t,n,c)):(_e&&s&&Gl(n),n.flags|=1,_n(t,n,a,c),n.child)}function $_(t,n,a,s,l){if(Ms(n),n.stateNode===null){var c=rr,p=a.contextType;typeof p=="object"&&p!==null&&(c=Tn(p)),c=new a(s,c),n.memoizedState=c.state!==null&&c.state!==void 0?c.state:null,c.updater=Ff,n.stateNode=c,c._reactInternals=n,c=n.stateNode,c.props=s,c.state=n.memoizedState,c.refs={},pf(n),p=a.contextType,c.context=typeof p=="object"&&p!==null?Tn(p):rr,c.state=n.memoizedState,p=a.getDerivedStateFromProps,typeof p=="function"&&(Bf(n,a,p,s),c.state=n.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof c.getSnapshotBeforeUpdate=="function"||typeof c.UNSAFE_componentWillMount!="function"&&typeof c.componentWillMount!="function"||(p=c.state,typeof c.componentWillMount=="function"&&c.componentWillMount(),typeof c.UNSAFE_componentWillMount=="function"&&c.UNSAFE_componentWillMount(),p!==c.state&&Ff.enqueueReplaceState(c,c.state,null),Uo(n,s,c,l),Do(),c.state=n.memoizedState),typeof c.componentDidMount=="function"&&(n.flags|=4194308),s=!0}else if(t===null){c=n.stateNode;var E=n.memoizedProps,N=ws(a,E);c.props=N;var q=c.context,et=a.contextType;p=rr,typeof et=="object"&&et!==null&&(p=Tn(et));var pt=a.getDerivedStateFromProps;et=typeof pt=="function"||typeof c.getSnapshotBeforeUpdate=="function",E=n.pendingProps!==E,et||typeof c.UNSAFE_componentWillReceiveProps!="function"&&typeof c.componentWillReceiveProps!="function"||(E||q!==p)&&F_(n,c,s,p),La=!1;var X=n.memoizedState;c.state=X,Uo(n,s,c,l),Do(),q=n.memoizedState,E||X!==q||La?(typeof pt=="function"&&(Bf(n,a,pt,s),q=n.memoizedState),(N=La||B_(n,a,N,s,X,q,p))?(et||typeof c.UNSAFE_componentWillMount!="function"&&typeof c.componentWillMount!="function"||(typeof c.componentWillMount=="function"&&c.componentWillMount(),typeof c.UNSAFE_componentWillMount=="function"&&c.UNSAFE_componentWillMount()),typeof c.componentDidMount=="function"&&(n.flags|=4194308)):(typeof c.componentDidMount=="function"&&(n.flags|=4194308),n.memoizedProps=s,n.memoizedState=q),c.props=s,c.state=q,c.context=p,s=N):(typeof c.componentDidMount=="function"&&(n.flags|=4194308),s=!1)}else{c=n.stateNode,mf(t,n),p=n.memoizedProps,et=ws(a,p),c.props=et,pt=n.pendingProps,X=c.context,q=a.contextType,N=rr,typeof q=="object"&&q!==null&&(N=Tn(q)),E=a.getDerivedStateFromProps,(q=typeof E=="function"||typeof c.getSnapshotBeforeUpdate=="function")||typeof c.UNSAFE_componentWillReceiveProps!="function"&&typeof c.componentWillReceiveProps!="function"||(p!==pt||X!==N)&&F_(n,c,s,N),La=!1,X=n.memoizedState,c.state=X,Uo(n,s,c,l),Do();var $=n.memoizedState;p!==pt||X!==$||La||t!==null&&t.dependencies!==null&&kl(t.dependencies)?(typeof E=="function"&&(Bf(n,a,E,s),$=n.memoizedState),(et=La||B_(n,a,et,s,X,$,N)||t!==null&&t.dependencies!==null&&kl(t.dependencies))?(q||typeof c.UNSAFE_componentWillUpdate!="function"&&typeof c.componentWillUpdate!="function"||(typeof c.componentWillUpdate=="function"&&c.componentWillUpdate(s,$,N),typeof c.UNSAFE_componentWillUpdate=="function"&&c.UNSAFE_componentWillUpdate(s,$,N)),typeof c.componentDidUpdate=="function"&&(n.flags|=4),typeof c.getSnapshotBeforeUpdate=="function"&&(n.flags|=1024)):(typeof c.componentDidUpdate!="function"||p===t.memoizedProps&&X===t.memoizedState||(n.flags|=4),typeof c.getSnapshotBeforeUpdate!="function"||p===t.memoizedProps&&X===t.memoizedState||(n.flags|=1024),n.memoizedProps=s,n.memoizedState=$),c.props=s,c.state=$,c.context=N,s=et):(typeof c.componentDidUpdate!="function"||p===t.memoizedProps&&X===t.memoizedState||(n.flags|=4),typeof c.getSnapshotBeforeUpdate!="function"||p===t.memoizedProps&&X===t.memoizedState||(n.flags|=1024),s=!1)}return c=s,_r(t,n),s=(n.flags&128)!==0,c||s?(c=n.stateNode,a=s&&typeof a.getDerivedStateFromError!="function"?null:c.render(),n.flags|=1,t!==null&&s?(n.child=Rs(n,t.child,null,l),n.child=Rs(n,null,a,l)):_n(t,n,a,l),n.memoizedState=c.state,t=n.child):t=ha(t,n,l),t}function tg(t,n,a,s){return Ss(),n.flags|=256,_n(t,n,a,s),n.child}var Xf={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function kf(t){return{baseLanes:t,cachePool:Xm()}}function Yf(t,n,a){return t=t!==null?t.childLanes&~a:0,n&&(t|=ii),t}function eg(t,n,a){var s=n.pendingProps,l=!1,c=(n.flags&128)!==0,p;if((p=c)||(p=t!==null&&t.memoizedState===null?!1:(An.current&2)!==0),p&&(l=!0,n.flags&=-129),p=(n.flags&32)!==0,n.flags&=-33,t===null){if(_e){if(l?Ia(n):Ba(),(t=je)?(t=E0(t,_i),t=t!==null&&t.data!=="&"?t:null,t!==null&&(n.memoizedState={dehydrated:t,treeContext:Ca!==null?{id:Ii,overflow:Bi}:null,retryLane:536870912,hydrationErrors:null},a=Om(t),a.return=n,n.child=a,yn=n,je=null)):t=null,t===null)throw Da(n);return kh(t)?n.lanes=32:n.lanes=536870912,null}return c=s.children,s=s.fallback,l?(Ba(),l=n.mode,c=cu({mode:"hidden",children:c},l),s=vs(s,l,a,null),c.return=n,s.return=n,c.sibling=s,n.child=c,s=n.child,s.memoizedState=kf(a),s.childLanes=Yf(t,p,a),n.memoizedState=Xf,zo(null,s)):(Ia(n),qf(n,c))}var E=t.memoizedState;if(E!==null){var N=E.dehydrated;if(N!==null)return nx(t,n,c,p,s,N,E,a)}return l?(Ba(),l=s.fallback,c=n.mode,E=t.child,N=E.sibling,s=ra(E,{mode:"hidden",children:s.children}),s.subtreeFlags=E.subtreeFlags&1206910976,N!==null?l=ra(N,l):(l=vs(l,c,a,null),l.flags|=2),l.return=n,s.return=n,s.sibling=l,n.child=s,zo(null,s),s=n.child,l=t.child.memoizedState,l===null?l=kf(a):(c=l.cachePool,c!==null?(E=un._currentValue,c=c.parent!==E?{parent:E,pool:E}:c):c=Xm(),l={baseLanes:l.baseLanes|a,cachePool:c}),s.memoizedState=l,s.childLanes=Yf(t,p,a),n.memoizedState=Xf,zo(t.child,s)):(Ia(n),a=t.child,t=a.sibling,a=ra(a,{mode:"visible",children:s.children}),a.return=n,a.sibling=null,t!==null&&(p=n.deletions,p===null?(n.deletions=[t],n.flags|=16):p.push(t)),n.child=a,n.memoizedState=null,a)}function qf(t,n){return n=cu({mode:"visible",children:n},t.mode),n.return=t,t.child=n}function cu(t,n){return t=kn(22,t,null,n),t.lanes=0,t}function fu(t,n,a){return Rs(n,t.child,null,a),t=qf(n,n.pendingProps.children),t.flags|=2,n.memoizedState=null,t}function nx(t,n,a,s,l,c,p,E){if(a)return n.flags&256?(Ia(n),n.flags&=-257,fu(t,n,E)):n.memoizedState!==null?(Ba(),n.child=t.child,n.flags|=128,null):(Ba(),c=l.fallback,p=n.mode,l=cu({mode:"visible",children:l.children},p),c=vs(c,p,E,null),c.flags|=2,l.return=n,c.return=n,l.sibling=c,n.child=l,Rs(n,t.child,null,E),l=n.child,l.memoizedState=kf(E),l.childLanes=Yf(t,s,E),n.memoizedState=Xf,zo(null,l));if(Ia(n),kh(c)){if(s=c.nextSibling&&c.nextSibling.dataset,s)var N=s.dgst;return s=N,s!==""&&(l=Error(r(419)),l.stack="",l.digest=s,To({value:l,source:null,stack:null})),fu(t,n,E)}if(fn||xs(t,n,E,!1),s=(E&t.childLanes)!==0,fn||s){if(za.current!==null)return fu(t,n,E);if(s=Ye,s!==null&&(l=rt(s,E),l!==0&&l!==p.retryLane))throw p.retryLane=l,gs(t,l),jn(s,t,l),Gf;return Xh(c)||wu(),fu(t,n,E)}return Xh(c)?(n.flags|=192,n.child=t.child,null):(t=p.treeContext,je=vi(c.nextSibling),yn=n,_e=!0,wa=null,_i=!1,t!==null&&Im(n,t),n=qf(n,l.children),n.flags|=134221824,n)}function ng(t,n,a){t.lanes|=n;var s=t.alternate;s!==null&&(s.lanes|=n),Xl(t.return,n,a)}function ig(t){for(var n=null;t!==null;){var a=t.alternate;a!==null&&Jl(a)===null&&(n=t),t=t.sibling}return n}function hu(t,n,a,s,l,c){var p=t.memoizedState;p===null?t.memoizedState={isBackwards:n,rendering:null,renderingStartTime:0,last:s,tail:a,tailMode:l,treeForkCount:c}:(p.isBackwards=n,p.rendering=null,p.renderingStartTime=0,p.last=s,p.tail=a,p.tailMode=l,p.treeForkCount=c)}function Wf(t){var n=t.child;for(t.child=null;n!==null;){var a=n.sibling;n.sibling=t.child,t.child=n,n=a}}function jf(t,n,a){var s=n.pendingProps,l=s.revealOrder,c=s.tail;s=s.children;var p=An.current;if(n.flags&128)return No(n,p),null;var E=(p&2)!==0;if(E?(p=p&1|2,n.flags|=128):p&=1,No(n,p),l==="backwards"&&t!==null?(Wf(t),_n(t,n,s,a),Wf(t)):_n(t,n,s,a),s=_e?Eo:0,!E&&t!==null&&(t.flags&128)!==0)t:for(t=n.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&ng(t,a,n);else if(t.tag===19)ng(t,a,n);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===n)break t;for(;t.sibling===null;){if(t.return===null||t.return===n)break t;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(l){case"backwards":a=ig(n.child),a===null?(l=n.child,n.child=null):(l=a.sibling,a.sibling=null,Wf(n)),hu(n,!0,l,null,c,s);break;case"unstable_legacy-backwards":for(a=null,l=n.child,n.child=null;l!==null;){if(t=l.alternate,t!==null&&Jl(t)===null){n.child=l;break}t=l.sibling,l.sibling=a,a=l,l=t}hu(n,!0,a,null,c,s);break;case"together":hu(n,!1,null,null,void 0,s);break;case"independent":n.memoizedState=null;break;default:a=ig(n.child),a===null?(l=n.child,n.child=null):(l=a.sibling,a.sibling=null),hu(n,!1,l,a,c,s)}return n.child}function ag(t,n,a){var s=n.pendingProps;return Ua(n,n.type,s.value),_n(t,n,s.children,a),n.child}function ha(t,n,a){if(t!==null&&(n.dependencies=t.dependencies),Va|=n.lanes,(a&n.childLanes)===0)if(t!==null){if(xs(t,n,a,!1),(a&n.childLanes)===0)return null}else return null;if(t!==null&&n.child!==t.child)throw Error(r(153));if(n.child!==null){for(t=n.child,a=ra(t,t.pendingProps),n.child=a,a.return=n;t.sibling!==null;)t=t.sibling,a=a.sibling=ra(t,t.pendingProps),a.return=n;a.sibling=null}return n.child}function Zf(t,n){return(t.lanes&n)!==0?!0:(t=t.dependencies,!!(t!==null&&kl(t)))}function ix(t,n,a){switch(n.tag){case 3:U(n,n.stateNode.containerInfo),Ua(n,un,t.memoizedState.cache),Ss();break;case 27:case 5:tt(n);break;case 4:U(n,n.stateNode.containerInfo);break;case 10:Ua(n,n.type,n.memoizedProps.value);break;case 31:if(n.memoizedState!==null)return n.flags|=128,yf(n),null;break;case 13:var s=n.memoizedState;if(s!==null){if(s.dehydrated!==null)return Ia(n),n.flags|=128,null;s=xs(t,n,a,!1);var l=n.child.childLanes;return s||(a&l)!==0?eg(t,n,a):(Ia(n),t=ha(t,n,a),t!==null?t.sibling:null)}Ia(n);break;case 19:if(n.flags&128)return jf(t,n,a);if(l=(t.flags&128)!==0,s=(a&n.childLanes)!==0,s||(xs(t,n,a,!1),s=(a&n.childLanes)!==0),l){if(s)return jf(t,n,a);n.flags|=128}if(l=n.memoizedState,l!==null&&(l.rendering=null,l.tail=null,l.lastEffect=null),No(n,An.current),s)break;return null;case 22:return n.lanes=0,Z_(t,n,a,n.pendingProps);case 24:Ua(n,un,t.memoizedState.cache)}return ha(t,n,a)}function sg(t,n,a){if(t!==null)if(t.memoizedProps!==n.pendingProps)fn=!0;else{if(!Zf(t,a)&&(n.flags&128)===0)return fn=!1,ix(t,n,a);fn=(t.flags&131072)!==0}else fn=!1,_e&&(n.flags&1048576)!==0&&zm(n,Eo,n.index);switch(n.lanes=0,n.tag){case 16:t:{var s=n.pendingProps;if(t=bs(n.elementType),n.type=t,typeof t=="function")ef(t)?(s=ws(t,s),n.tag=1,n=$_(null,n,t,s,a)):(n.tag=0,n=Vf(null,n,t,s,a));else{if(t!=null){var l=t.$$typeof;if(l===W){n.tag=11,n=q_(null,n,t,s,a);break t}else if(l===gt){n.tag=14,n=W_(null,n,t,s,a);break t}else if(l===lt){n.tag=10,n.type=t,n=ag(null,n,a);break t}}throw n=Ut(t)||t,Error(r(306,n,""))}}return n;case 0:return Vf(t,n,n.type,n.pendingProps,a);case 1:return s=n.type,l=ws(s,n.pendingProps),$_(t,n,s,l,a);case 3:t:{if(U(n,n.stateNode.containerInfo),t===null)throw Error(r(387));s=n.pendingProps;var c=n.memoizedState;l=c.element,mf(t,n),Uo(n,s,null,a);var p=n.memoizedState;if(s=p.cache,Ua(n,un,s),s!==c.cache&&uf(n,[un],a,!0),Do(),s=p.element,c.isDehydrated)if(c={element:s,isDehydrated:!1,cache:p.cache},n.updateQueue.baseState=c,n.memoizedState=c,n.flags&256){n=tg(t,n,s,a);break t}else if(s!==l){l=di(Error(r(424)),n),To(l),n=tg(t,n,s,a);break t}else for(t=n.stateNode.containerInfo,t.nodeType===9?t=t.body:t=t.nodeName==="HTML"?t.ownerDocument.body:t,je=vi(t.firstChild),yn=n,_e=!0,wa=null,_i=!0,a=Zm(n,null,s,a),n.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(Ss(),s===l){n=ha(t,n,a);break t}_n(t,n,s,a)}n=n.child}return n;case 26:return _r(t,n),t===null?(a=D0(n.type,null,n.pendingProps,null))?n.memoizedState=a:_e||(n.stateNode=u0(n.type,n.pendingProps,ke.current,n)):n.memoizedState=D0(n.type,t.memoizedProps,n.pendingProps,t.memoizedState),null;case 27:return tt(n),t===null&&_e&&(s=n.stateNode=A0(n.type,n.pendingProps,ke.current),yn=n,_i=!0,l=je,qa(n.type)?(Yh=l,je=vi(s.firstChild)):je=l),_n(t,n,n.pendingProps.children,a),_r(t,n),t===null&&(n.flags|=4194304),n.child;case 5:return t===null&&_e&&((l=s=je)&&(s=Qx(s,n.type,n.pendingProps,_i),s!==null?(n.stateNode=s,yn=n,je=vi(s.firstChild),_i=!1,l=!0):l=!1),l||Da(n)),tt(n),l=n.type,c=n.pendingProps,p=t!==null?t.memoizedProps:null,s=c.children,zh(l,c)?s=null:p!==null&&zh(l,p)&&(n.flags|=32),n.memoizedState!==null&&(l=Ef(t,n,qy,null,null,a),Or._currentValue=l),_r(t,n),_n(t,n,s,a),n.child;case 6:return t===null&&_e&&((t=a=je)&&(a=Jx(a,n.pendingProps,_i),a!==null?(n.stateNode=a,yn=n,je=null,t=!0):t=!1),t||Da(n)),null;case 13:return eg(t,n,a);case 4:return U(n,n.stateNode.containerInfo),s=n.pendingProps,t===null?n.child=Rs(n,null,s,a):_n(t,n,s,a),n.child;case 11:return q_(t,n,n.type,n.pendingProps,a);case 7:return s=n.pendingProps,_r(t,n),_n(t,n,s,a),n.child;case 8:return _n(t,n,n.pendingProps.children,a),n.child;case 12:return _n(t,n,n.pendingProps.children,a),n.child;case 10:return ag(t,n,a);case 9:return l=n.type._context,s=n.pendingProps.children,Ms(n),l=Tn(l),s=s(l),n.flags|=1,_n(t,n,s,a),n.child;case 14:return W_(t,n,n.type,n.pendingProps,a);case 15:return j_(t,n,n.type,n.pendingProps,a);case 19:return jf(t,n,a);case 31:return ex(t,n,a);case 22:return Z_(t,n,a,n.pendingProps);case 24:return Ms(n),s=Tn(un),t===null?(l=hf(),l===null&&(l=Ye,c=cf(),l.pooledCache=c,c.refCount++,c!==null&&(l.pooledCacheLanes|=a),l=c),n.memoizedState={parent:s,cache:l},pf(n),Ua(n,un,l)):((t.lanes&a)!==0&&(mf(t,n),Uo(n,null,null,a),Do()),l=t.memoizedState,c=n.memoizedState,l.parent!==s?(l={parent:s,cache:s},n.memoizedState=l,n.lanes===0&&(n.memoizedState=n.updateQueue.baseState=l),Ua(n,un,s)):(s=c.cache,Ua(n,un,s),s!==l.cache&&uf(n,[un],a,!0))),_n(t,n,n.pendingProps.children,a),n.child;case 30:return n.stateNode===null&&(n.stateNode={autoName:null,paired:null,clones:null,ref:null}),s=n.pendingProps,s.name!=null&&s.name!=="auto"?n.flags|=t===null?18882560:18874368:_e&&Gl(n),t!==null&&t.memoizedProps.name!==s.name?n.flags|=4194816:_r(t,n),_n(t,n,s.children,a),n.child;case 29:throw n.pendingProps}throw Error(r(156,n.tag))}function da(t){t.flags|=4}function Kf(t,n,a,s,l){var c;if((c=(t.mode&32)!==0)&&(c=a===null?O0(n,s):O0(n,s)&&(s.src!==a.src||s.srcSet!==a.srcSet)),c){if(t.flags|=16777216,(l&335544128)===l)if(t.stateNode.complete)t.flags|=8192;else if(Hg())t.flags|=8192;else throw As=jl,df}else t.flags&=-16777217}function rg(t,n){if(n.type!=="stylesheet"||(n.state.loading&4)!==0)t.flags&=-16777217;else if(t.flags|=16777216,!P0(n))if(Hg())t.flags|=8192;else throw As=jl,df}function du(t,n){n!==null&&(t.flags|=4),t.flags&16384&&(n=t.tag!==22?bl():536870912,t.lanes|=n,xr|=n)}function Io(t,n){if(!_e)switch(t.tailMode){case"visible":break;case"collapsed":for(var a=t.tail,s=null;a!==null;)a.alternate!==null&&(s=a),a=a.sibling;s===null?n||t.tail===null?t.tail=null:t.tail.sibling=null:s.sibling=null;break;default:for(n=t.tail,a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?t.tail=null:a.sibling=null}}function Ze(t){var n=t.alternate!==null&&t.alternate.child===t.child,a=0,s=0;if(n)for(var l=t.child;l!==null;)a|=l.lanes|l.childLanes,s|=l.subtreeFlags&1206910976,s|=l.flags&1206910976,l.return=t,l=l.sibling;else for(l=t.child;l!==null;)a|=l.lanes|l.childLanes,s|=l.subtreeFlags,s|=l.flags,l.return=t,l=l.sibling;return t.subtreeFlags|=s,t.childLanes=a,n}function ax(t,n,a){var s=n.pendingProps;switch(sf(n),n.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ze(n),null;case 1:return Ze(n),null;case 3:return a=n.stateNode,s=null,t!==null&&(s=t.memoizedState.cache),n.memoizedState.cache!==s&&(n.flags|=2048),ua(un),T(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(t===null||t.child===null)&&(ur(n)?da(n):t===null||t.memoizedState.isDehydrated&&(n.flags&256)===0||(n.flags|=1024,of())),Ze(n),null;case 26:var l=n.type,c=n.memoizedState;return t===null?(da(n),c!==null?(Ze(n),rg(n,c)):(Ze(n),Kf(n,l,null,s,a))):c?c!==t.memoizedState?(da(n),Ze(n),rg(n,c)):(Ze(n),n.flags&=-16777217):(t=t.memoizedProps,t!==s&&da(n),Ze(n),Kf(n,l,t,s,a)),null;case 27:if(dt(n),a=ke.current,l=n.type,t!==null&&n.stateNode!=null)t.memoizedProps!==s&&da(n);else{if(!s){if(n.stateNode===null)throw Error(r(166));return Ze(n),n.subtreeFlags&=-33554433,null}t=Bt.current,ur(n)?Bm(n):(t=A0(l,s,a),n.stateNode=t,da(n))}return Ze(n),n.subtreeFlags&=-33554433,null;case 5:if(dt(n),l=n.type,t!==null&&n.stateNode!=null)t.memoizedProps!==s&&da(n);else{if(!s){if(n.stateNode===null)throw Error(r(166));return Ze(n),n.subtreeFlags&=-33554433,null}if(c=Bt.current,ur(n))Bm(n);else{var p=jo(ke.current);switch(c){case 1:c=p.createElementNS("http://www.w3.org/2000/svg",l);break;case 2:c=p.createElementNS("http://www.w3.org/1998/Math/MathML",l);break;default:switch(l){case"svg":c=p.createElementNS("http://www.w3.org/2000/svg",l);break;case"math":c=p.createElementNS("http://www.w3.org/1998/Math/MathML",l);break;case"script":c=p.createElement("div"),c.innerHTML="<script><\/script>",c=c.removeChild(c.firstChild);break;case"select":c=typeof s.is=="string"?p.createElement("select",{is:s.is}):p.createElement("select"),s.multiple?c.multiple=!0:s.size&&(c.size=s.size);break;default:c=typeof s.is=="string"?p.createElement(l,{is:s.is}):p.createElement(l)}}c[Ct]=n,c[Xt]=s;t:for(p=n.child;p!==null;){if(p.tag===5||p.tag===6)c.appendChild(p.stateNode);else if(p.tag!==4&&p.tag!==27&&p.child!==null){p.child.return=p,p=p.child;continue}if(p===n)break t;for(;p.sibling===null;){if(p.return===null||p.return===n)break t;p=p.return}p.sibling.return=p.return,p=p.sibling}n.stateNode=c;t:switch(Cn(c,l,s),l){case"button":case"input":case"select":case"textarea":s=!!s.autoFocus;break t;case"img":s=!0;break t;default:s=!1}s&&da(n)}}return Ze(n),n.subtreeFlags&=-33554433,Kf(n,n.type,t===null?null:t.memoizedProps,n.pendingProps,a),null;case 6:if(t&&n.stateNode!=null)t.memoizedProps!==s&&da(n);else{if(typeof s!="string"&&n.stateNode===null)throw Error(r(166));if(t=ke.current,ur(n)){if(t=n.stateNode,a=n.memoizedProps,s=null,l=yn,l!==null)switch(l.tag){case 27:case 5:s=l.memoizedProps}t[Ct]=n,t=!!(t.nodeValue===a||s!==null&&s.suppressHydrationWarning===!0||s0(t.nodeValue,a)),t||Da(n,!0)}else t=jo(t).createTextNode(s),t[Ct]=n,n.stateNode=t}return Ze(n),null;case 31:if(a=n.memoizedState,t===null||t.memoizedState!==null){if(s=ur(n),a!==null){if(t===null){if(!s)throw Error(r(318));if(t=n.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(r(557));t[Ct]=n}else Ss(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;Ze(n),t=!1}else a=of(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=a),t=!0;if(!t)return n.flags&256?(ti(n),n):(ti(n),null);if((n.flags&128)!==0)throw Error(r(558))}return Ze(n),null;case 13:if(s=n.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(l=ur(n),s!==null&&s.dehydrated!==null){if(t===null){if(!l)throw Error(r(318));if(l=n.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(r(317));l[Ct]=n}else Ss(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;Ze(n),l=!1}else l=of(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=l),l=!0;if(!l)return n.flags&256?(ti(n),n):(ti(n),null)}return ti(n),(n.flags&128)!==0?(n.lanes=a,n):(a=s!==null,t=t!==null&&t.memoizedState!==null,a&&(s=n.child,l=null,s.alternate!==null&&s.alternate.memoizedState!==null&&s.alternate.memoizedState.cachePool!==null&&(l=s.alternate.memoizedState.cachePool.pool),c=null,s.memoizedState!==null&&s.memoizedState.cachePool!==null&&(c=s.memoizedState.cachePool.pool),c!==l&&(s.flags|=2048)),a!==t&&a&&(n.child.flags|=8192),du(n,n.updateQueue),Ze(n),null);case 4:return T(),t===null&&Uh(n.stateNode.containerInfo),n.flags|=67108864,Ze(n),null;case 10:return ua(n.type),Ze(n),null;case 19:if(xf(n),s=n.memoizedState,s===null)return Ze(n),null;if(l=(n.flags&128)!==0,c=s.rendering,c===null)if(l)Io(s,!1);else{if(an!==0||t!==null&&(t.flags&128)!==0)for(t=n.child;t!==null;){if(c=Jl(t),c!==null){for(n.flags|=128,Io(s,!1),t=c.updateQueue,n.updateQueue=t,du(n,t),n.subtreeFlags=0,t=a,a=n.child;a!==null;)Lm(a,t),a=a.sibling;return No(n,An.current&1|2),_e&&oa(n,s.treeForkCount),n.child}t=t.sibling}s.tail!==null&&G()>bu&&(n.flags|=128,l=!0,Io(s,!1),n.lanes=4194304)}else{if(!l)if(t=Jl(c),t!==null){if(n.flags|=128,l=!0,t=t.updateQueue,n.updateQueue=t,du(n,t),Io(s,!0),s.tail===null&&s.tailMode!=="collapsed"&&s.tailMode!=="visible"&&!c.alternate&&!_e)return Ze(n),null}else 2*G()-s.renderingStartTime>bu&&a!==536870912&&(n.flags|=128,l=!0,Io(s,!1),n.lanes=4194304);s.isBackwards?(c.sibling=n.child,n.child=c):(t=s.last,t!==null?t.sibling=c:n.child=c,s.last=c)}if(s.tail!==null){t=s.tail;t:{for(a=t;a!==null;){if(a.alternate!==null){a=!1;break t}a=a.sibling}a=!0}return s.rendering=t,s.tail=t.sibling,s.renderingStartTime=G(),t.sibling=null,c=An.current,c=l?c&1|2:c&1,s.tailMode==="visible"||s.tailMode==="collapsed"||!a||_e?No(n,c):(a=c,ne(bn,n),ne(An,a),Ln===null&&(Ln=n)),_e&&oa(n,s.treeForkCount),t}return Ze(n),null;case 22:case 23:return ti(n),Sf(),s=n.memoizedState!==null,t!==null?t.memoizedState!==null!==s&&(n.flags|=8192):s&&(n.flags|=8192),s?(a&536870912)!==0&&(n.flags&128)===0&&(Ze(n),n.subtreeFlags&6&&(n.flags|=8192)):Ze(n),a=n.updateQueue,a!==null&&du(n,a.retryQueue),a=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),s=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(s=n.memoizedState.cachePool.pool),s!==a&&(n.flags|=2048),t!==null&&Nt(Ts),null;case 24:return a=null,t!==null&&(a=t.memoizedState.cache),n.memoizedState.cache!==a&&(n.flags|=2048),ua(un),Ze(n),null;case 25:return null;case 30:return n.flags|=33554432,Ze(n),null}throw Error(r(156,n.tag))}function sx(t,n){switch(sf(n),n.tag){case 1:return t=n.flags,t&65536?(n.flags=t&-65537|128,n):null;case 3:return ua(un),T(),t=n.flags,(t&65536)!==0&&(t&128)===0?(n.flags=t&-65537|128,n):null;case 26:case 27:case 5:return dt(n),null;case 31:if(n.memoizedState!==null){if(ti(n),n.alternate===null)throw Error(r(340));Ss()}return t=n.flags,t&65536?(n.flags=t&-65537|128,n):null;case 13:if(ti(n),t=n.memoizedState,t!==null&&t.dehydrated!==null){if(n.alternate===null)throw Error(r(340));Ss()}return t=n.flags,t&65536?(n.flags=t&-65537|128,n):null;case 19:return xf(n),t=n.flags,t&65536?(n.flags=t&-65537|128,t=n.memoizedState,t!==null&&(t.rendering=null,t.tail=null),n.flags|=4,n):null;case 4:return T(),null;case 10:return ua(n.type),null;case 22:case 23:return ti(n),Sf(),t!==null&&Nt(Ts),t=n.flags,t&65536?(n.flags=t&-65537|128,n):null;case 24:return ua(un),null;case 25:return null;default:return null}}function og(t,n){switch(sf(n),n.tag){case 3:ua(un),T();break;case 26:case 27:case 5:dt(n);break;case 4:T();break;case 31:n.memoizedState!==null&&ti(n);break;case 13:ti(n);break;case 19:xf(n);break;case 10:ua(n.type);break;case 22:case 23:ti(n),Sf(),t!==null&&Nt(Ts);break;case 24:ua(un)}}function Bo(t,n){try{var a=n.updateQueue,s=a!==null?a.lastEffect:null;if(s!==null){var l=s.next;a=l;do{if((a.tag&t)===t){s=void 0;var c=a.create,p=a.inst;s=c(),p.destroy=s}a=a.next}while(a!==l)}}catch(E){Ie(n,n.return,E)}}function Fa(t,n,a){try{var s=n.updateQueue,l=s!==null?s.lastEffect:null;if(l!==null){var c=l.next;s=c;do{if((s.tag&t)===t){var p=s.inst,E=p.destroy;if(E!==void 0){p.destroy=void 0,l=n;var N=a,q=E;try{q()}catch(et){Ie(l,N,et)}}}s=s.next}while(s!==c)}}catch(et){Ie(n,n.return,et)}}function lg(t){var n=t.updateQueue;if(n!==null){var a=t.stateNode;try{Qm(n,a)}catch(s){Ie(t,t.return,s)}}}function ug(t,n,a){a.props=ws(t.type,t.memoizedProps),a.state=t.memoizedState;try{a.componentWillUnmount()}catch(s){Ie(t,n,s)}}function Fi(t,n){try{var a=t.ref;if(a!==null){switch(t.tag){case 26:case 27:case 5:var s=t.stateNode;break;case 30:var l=t.stateNode,c=aa(t.memoizedProps,l);(l.ref===null||l.ref.name!==c)&&(l.ref=_0(c)),s=l.ref;break;case 7:if(t.stateNode===null){var p=new si(t);m(t.child,!1,Zx,p,void 0,void 0),t.stateNode=p}s=t.stateNode;break;default:s=t.stateNode}typeof a=="function"?t.refCleanup=a(s):a.current=s}}catch(E){Ie(t,n,E)}}function Rn(t,n){var a=t.ref,s=t.refCleanup;if(a!==null)if(typeof s=="function")try{s()}catch(l){Ie(t,n,l)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(l){Ie(t,n,l)}else a.current=null}function pu(t,n){if((t.tag===5||t.tag===27||t.tag===6)&&t.alternate===null&&n!==null)for(var a=0;a<n.length;a++)M0(t.stateNode,n[a])}function cg(t){for(var n=t.return;n!==null&&(Jf(n)&&M0(t.stateNode,n.stateNode),!Qf(n));)n=n.return}function Fo(t){for(var n=t.return;n!==null&&(Jf(n)&&Kx(t.stateNode,n.stateNode),!Qf(n));)n=n.return}function Qf(t){return t.tag===5||t.tag===3||t.tag===27}function Jf(t){return t&&t.tag===7&&t.stateNode!==null}function $f(t){var n=t.type,a=t.memoizedProps,s=t.stateNode;try{t:switch(n){case"button":case"input":case"select":case"textarea":a.autoFocus&&s.focus();break t;case"img":a.src?s.src=a.src:a.srcSet&&(s.srcset=a.srcSet)}}catch(l){Ie(t,t.return,l)}}function th(t,n,a){try{var s=t.stateNode;Ux(s,t.type,a,n),s[Xt]=n}catch(l){Ie(t,t.return,l)}}function fg(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&qa(t.type)||t.tag===4}function eh(t){t:for(;;){for(;t.sibling===null;){if(t.return===null||fg(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&qa(t.type)||t.flags&2||t.child===null||t.tag===4)continue t;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function nh(t,n,a,s){var l=t.tag;if(l===5||l===6)l=t.stateNode,n?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(l,n):(n=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,n.appendChild(l),a=a._reactRootContainer,a!=null||n.onclick!==null||(n.onclick=zi)),pu(t,s),Ce=!0;else if(l!==4&&(l===27&&(pu(t,s),s=null,qa(t.type)&&(a=t.stateNode,n=null)),t=t.child,t!==null))for(nh(t,n,a,s),t=t.sibling;t!==null;)nh(t,n,a,s),t=t.sibling}function mu(t,n,a,s){var l=t.tag;if(l===5||l===6)l=t.stateNode,n?a.insertBefore(l,n):a.appendChild(l),pu(t,s),Ce=!0;else if(l!==4&&(l===27&&(pu(t,s),s=null,qa(t.type)&&(a=t.stateNode)),t=t.child,t!==null))for(mu(t,n,a,s),t=t.sibling;t!==null;)mu(t,n,a,s),t=t.sibling}function hg(t){var n=t.stateNode,a=t.memoizedProps;try{for(var s=t.type,l=n.attributes;l.length;)n.removeAttributeNode(l[0]);Cn(n,s,a),n[Ct]=t,n[Xt]=a}catch(c){Ie(t,t.return,c)}}var _u=!1,ei=null;function dg(t){(t.tag===30||(t.subtreeFlags&33554432)!==0)&&(_u=!0)}var Hi=null;function pg(){var t=Hi;return Hi=null,t}var Yn=0;function gr(t,n,a,s,l){return Yn=0,mg(t.child,n,a,s,l)}function mg(t,n,a,s,l){for(var c=!1;t!==null;){if(t.tag===5){var p=t.stateNode;if(s!==null){var E=Fh(p);s.push(E),E.view&&(c=!0)}else c||Fh(p).view&&(c=!0);_u=!0,p0(p,Yn===0?n:n+"_"+Yn,a),Yn++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&l||mg(t.child,n,a,s,l)&&(c=!0));t=t.sibling}return c}function Gi(t,n){for(;t!==null;)t.tag===5?m0(t.stateNode,t.memoizedProps):(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&n||Gi(t.child,n)),t=t.sibling}function gu(t){if((t.subtreeFlags&18874368)!==0)for(t=t.child;t!==null;){if((t.tag!==22||t.memoizedState===null)&&(gu(t),t.tag===30&&(t.flags&18874368)!==0&&t.stateNode.paired)){var n=t.memoizedProps;if(n.name==null||n.name==="auto")throw Error(r(544));var a=n.name;n=sa(n.default,n.share),n!=="none"&&(gr(t,a,n,null,!1)||Gi(t.child,!1))}t=t.sibling}}function ih(t,n){if(t.tag===30){var a=t.stateNode,s=t.memoizedProps,l=aa(s,a),c=sa(s.default,a.paired?s.share:s.enter);c!=="none"?gr(t,l,c,null,!1)?(gu(t),a.paired||n||br(t,s.onEnter)):Gi(t.child,!1):gu(t)}else if((t.subtreeFlags&33554432)!==0)for(t=t.child;t!==null;)ih(t,n),t=t.sibling;else gu(t)}function ah(t){if(ei!==null&&ei.size!==0){var n=ei;if((t.subtreeFlags&18874368)!==0)for(t=t.child;t!==null;){if(t.tag!==22||t.memoizedState===null){if(t.tag===30&&(t.flags&18874368)!==0){var a=t.memoizedProps,s=a.name;if(s!=null&&s!=="auto"){var l=n.get(s);if(l!==void 0){var c=sa(a.default,a.share);if(c!=="none"&&(gr(t,s,c,null,!1)?(c=t.stateNode,l.paired=c,c.paired=l,br(t,a.onShare)):Gi(t.child,!1)),n.delete(s),n.size===0)break}}}ah(t)}t=t.sibling}}}function sh(t){if(t.tag===30){var n=t.memoizedProps,a=aa(n,t.stateNode),s=ei!==null?ei.get(a):void 0,l=sa(n.default,s!==void 0?n.share:n.exit);l!=="none"&&(gr(t,a,l,null,!1)?s!==void 0?(l=t.stateNode,s.paired=l,l.paired=s,ei.delete(a),br(t,n.onShare)):br(t,n.onExit):Gi(t.child,!1)),ei!==null&&ah(t)}else if((t.subtreeFlags&33554432)!==0)for(t=t.child;t!==null;)sh(t),t=t.sibling;else ei!==null&&ah(t)}function _g(t){for(t=t.child;t!==null;){if(t.tag===30){var n=t.memoizedProps,a=aa(n,t.stateNode);n=sa(n.default,n.update),t.flags&=-5,n!=="none"&&gr(t,a,n,t.memoizedState=[],!1)}else(t.subtreeFlags&33554432)!==0&&_g(t);t=t.sibling}}function rh(t){if((t.subtreeFlags&18874368)!==0)for(t=t.child;t!==null;){if(t.tag!==22||t.memoizedState===null){if(t.tag===30&&(t.flags&18874368)!==0){var n=t.stateNode;n.paired!==null&&(n.paired=null,Gi(t.child,!1))}rh(t)}t=t.sibling}}function vu(t){if(t.tag===30)t.stateNode.paired=null,Gi(t.child,!1),rh(t);else if((t.subtreeFlags&33554432)!==0)for(t=t.child;t!==null;)vu(t),t=t.sibling;else rh(t)}function gg(t){for(t=t.child;t!==null;)t.tag===30?Gi(t.child,!1):(t.subtreeFlags&33554432)!==0&&gg(t),t=t.sibling}function oh(t,n,a,s,l,c,p){for(var E=!1;n!==null;){if(n.tag===5){var N=n.stateNode;if(c!==null&&Yn<c.length){var q=c[Yn],et=Fh(N);(q.view||et.view)&&(E=!0);var pt;if(pt=(t.flags&4)===0)if(et.clip)pt=!0;else{pt=q.rect;var X=et.rect;pt=pt.y!==X.y||pt.x!==X.x||pt.height!==X.height||pt.width!==X.width}pt&&(t.flags|=4),et.abs?et=!q.abs:(q=q.rect,et=et.rect,et=q.height!==et.height||q.width!==et.width),et&&(t.flags|=32)}else t.flags|=32;(t.flags&4)!==0&&p0(N,Yn===0?a:a+"_"+Yn,l),E&&(t.flags&4)!==0||(Hi===null&&(Hi=[]),Hi.push(N,Yn===0?s:s+"_"+Yn,n.memoizedProps)),Yn++}else(n.tag!==22||n.memoizedState===null)&&(n.tag===30&&p?t.flags|=n.flags&32:oh(t,n.child,a,s,l,c,p)&&(E=!0));n=n.sibling}return E}function vg(t,n){for(t=t.child;t!==null;){if(t.tag===30){var a=t.memoizedProps,s=t.stateNode,l=aa(a,s),c=sa(a.default,a.update),p;p=t.memoizedState,t.memoizedState=null,s=t;var E=t.child;Yn=0,l=oh(s,E,l,l,c,p,!1),(t.flags&4)!==0&&l&&br(t,a.onUpdate)}else(t.subtreeFlags&33554432)!==0&&vg(t);t=t.sibling}}var xn=!1,Pe=!1,Vi=!1,lh=!1,Sg=typeof WeakSet=="function"?WeakSet:Set,Mn=null,Xi=!1,Ho=!1,Su=!1,uh=!1;function rx(t,n,a){if(t=t.containerInfo,Oh=Pr,t=Em(t),jc(t)){if("selectionStart"in t)var s={start:t.selectionStart,end:t.selectionEnd};else t:{s=(s=t.ownerDocument)&&s.defaultView||window;var l=s.getSelection&&s.getSelection();if(l&&l.rangeCount!==0){s=l.anchorNode;var c=l.anchorOffset,p=l.focusNode;l=l.focusOffset;try{s.nodeType,p.nodeType}catch{s=null;break t}var E=0,N=-1,q=-1,et=0,pt=0,X=t,$=null;e:for(;;){for(var Dt;X!==s||c!==0&&X.nodeType!==3||(N=E+c),X!==p||l!==0&&X.nodeType!==3||(q=E+l),X.nodeType===3&&(E+=X.nodeValue.length),(Dt=X.firstChild)!==null;)$=X,X=Dt;for(;;){if(X===t)break e;if($===s&&++et===c&&(N=E),$===p&&++pt===l&&(q=E),(Dt=X.nextSibling)!==null)break;X=$,$=X.parentNode}X=Dt}s=N===-1||q===-1?null:{start:N,end:q}}else s=null}s=s||{start:0,end:0}}else s=null;for(Ph={focusedElem:t,selectionRange:s},Pr=!1,a=(a&335544064)===a,Mn=n,n=a?9270:1024;Mn!==null;){if(t=Mn,a&&(s=t.deletions,s!==null))for(c=0;c<s.length;c++)a&&sh(s[c]);if(t.alternate===null&&(t.flags&2)!==0)a&&dg(t),yu(a);else{if(t.tag===22){if(s=t.alternate,t.memoizedState!==null){s!==null&&s.memoizedState===null&&a&&sh(s),yu(a);continue}else if(s!==null&&s.memoizedState!==null){a&&dg(t),yu(a);continue}}s=t.child,(t.subtreeFlags&n)!==0&&s!==null?(s.return=t,Mn=s):(a&&_g(t),yu(a))}}ei=null}function yu(t){for(;Mn!==null;){var n=Mn,a=t,s=n.alternate,l=n.flags;switch(n.tag){case 0:case 11:case 15:break;case 1:if((l&1024)!==0&&s!==null){a=void 0,l=s.memoizedProps,s=s.memoizedState;var c=n.stateNode;try{var p=ws(n.type,l);a=c.getSnapshotBeforeUpdate(p,s),c.__reactInternalSnapshotBeforeUpdate=a}catch(E){Ie(n,n.return,E)}}break;case 3:if((l&1024)!==0){if(s=n.stateNode.containerInfo,a=s.nodeType,a===9)Vh(s);else if(a===1)switch(s.nodeName){case"HEAD":case"HTML":case"BODY":Vh(s);break;default:s.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&s!==null&&(a=aa(s.memoizedProps,s.stateNode),l=n.memoizedProps,l=sa(l.default,l.update),l!=="none"&&gr(s,a,l,s.memoizedState=[],!0));break;default:if((l&1024)!==0)throw Error(r(163))}if(s=n.sibling,s!==null){s.return=n.return,Mn=s;break}Mn=n.return}}function yg(t,n,a){var s=a.flags;switch(a.tag){case 0:case 11:case 15:ki(t,a),s&4&&Bo(5,a);break;case 1:if(ki(t,a),s&4)if(t=a.stateNode,n===null)try{t.componentDidMount()}catch(p){Ie(a,a.return,p)}else{var l=ws(a.type,n.memoizedProps);n=n.memoizedState;try{t.componentDidUpdate(l,n,t.__reactInternalSnapshotBeforeUpdate)}catch(p){Ie(a,a.return,p)}}s&64&&lg(a),s&512&&Fi(a,a.return);break;case 3:if(ki(t,a),s&64&&(t=a.updateQueue,t!==null)){if(n=null,a.child!==null)switch(a.child.tag){case 27:case 5:n=a.child.stateNode;break;case 1:n=a.child.stateNode}try{Qm(t,n)}catch(p){Ie(a,a.return,p)}}break;case 27:n===null&&s&4&&hg(a);case 26:case 5:ki(t,a),n===null&&s&4&&$f(a),s&512&&Fi(a,a.return);break;case 12:ki(t,a);break;case 31:ki(t,a),s&4&&Tg(t,a);break;case 13:ki(t,a),s&4&&bg(t,a),s&64&&(t=a.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(a=vx.bind(null,a),$x(t,a))));break;case 22:if(s=a.memoizedState!==null||xn,!s){var c=n!==null&&n.memoizedState!==null||Pe;n=xn,l=Pe,xn=s,(Pe=c)&&!l?(s=2,(a.subtreeFlags&8772)!==0&&(s|=1),Ai(t,a,s)):ki(t,a),xn=n,Pe=l}break;case 30:ki(t,a),s&512&&Fi(a,a.return);break;case 7:s&512&&Fi(a,a.return);default:ki(t,a)}}function ch(t,n){for(t=t.child;t!==null;)xg(t,n),t=t.sibling}function xg(t,n){switch(t.tag){case 5:case 26:try{var a=t.stateNode;if(n){var s=a.style;typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"}else{var l=t.stateNode,c=t.memoizedProps.style,p=c!=null&&c.hasOwnProperty("display")?c.display:null;l.style.display=p==null||typeof p=="boolean"?"":(""+p).trim()}}catch(N){Ie(t,t.return,N)}fh(t,n);break;case 6:try{t.stateNode.nodeValue=n?"":t.memoizedProps,Ce=!0}catch(N){Ie(t,t.return,N)}break;case 18:try{var E=t.stateNode;n?d0(E,!0):d0(t.stateNode,!1)}catch(N){Ie(t,t.return,N)}break;case 22:case 23:t.memoizedState===null&&ch(t,n);break;default:ch(t,n)}}function fh(t,n){if(t.subtreeFlags&67108864)for(t=t.child;t!==null;){t:{var a=t,s=n;switch(a.tag){case 4:xg(a,s);break t;case 22:a.memoizedState===null&&fh(a,s);break t;default:fh(a,s)}}t=t.sibling}}function Mg(t){var n=t.alternate;n!==null&&(t.alternate=null,Mg(n)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(n=t.stateNode,n!==null&&$t(n)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var Je=null,qn=!1;function Ti(t,n,a){for(a=a.child;a!==null;)Eg(t,n,a),a=a.sibling}function Eg(t,n,a){if($e&&typeof $e.onCommitFiberUnmount=="function")try{$e.onCommitFiberUnmount(xe,a)}catch{}switch(a.tag){case 26:Pe||Rn(a,n),Ti(t,n,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!Pe&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:Pe||Rn(a,n),Fo(a);var s=Je,l=qn;qa(a.type)&&(Je=a.stateNode,qn=!1),Ti(t,n,a),R0(a.stateNode,a.type,a.memoizedProps),Je=s,qn=l;break;case 5:Pe||Rn(a,n),Fo(a);case 6:if(a.tag===6&&Fo(a),s=Je,l=qn,Je=null,Ti(t,n,a),Je=s,qn=l,Je!==null)if(qn)try{(Je.nodeType===9?Je.body:Je.nodeName==="HTML"?Je.ownerDocument.body:Je).removeChild(a.stateNode),Ce=!0}catch(c){Ie(a,n,c)}else try{Je.removeChild(a.stateNode),Ce=!0}catch(c){Ie(a,n,c)}break;case 18:Je!==null&&(qn?(t=Je,h0(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,a.stateNode),zr(t)):h0(Je,a.stateNode));break;case 4:s=Je,l=qn,Je=a.stateNode.containerInfo,qn=!0,Ti(t,n,a),Je=s,qn=l;break;case 0:case 11:case 14:case 15:Fa(2,a,n),Pe||Fa(4,a,n),Ti(t,n,a);break;case 1:Pe||(Rn(a,n),s=a.stateNode,typeof s.componentWillUnmount=="function"&&ug(a,n,s)),Ti(t,n,a);break;case 21:Ti(t,n,a);break;case 22:Pe=(s=Pe)||a.memoizedState!==null,Ti(t,n,a),Pe=s;break;case 30:Rn(a,n),Ti(t,n,a);break;case 7:Pe||Rn(a,n),Ti(t,n,a);break;default:Ti(t,n,a)}}function Tg(t,n){if(n.memoizedState===null&&(t=n.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{zr(t)}catch(a){Ie(n,n.return,a)}}}function bg(t,n){if(n.memoizedState===null&&(t=n.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{zr(t)}catch(a){Ie(n,n.return,a)}}function ox(t){switch(t.tag){case 31:case 13:case 19:var n=t.stateNode;return n===null&&(n=t.stateNode=new Sg),n;case 22:return t=t.stateNode,n=t._retryCache,n===null&&(n=t._retryCache=new Sg),n;default:throw Error(r(435,t.tag))}}function xu(t,n){var a=ox(t);n.forEach(function(s){if(!a.has(s)){a.add(s);var l=Sx.bind(null,t,s);s.then(l,l)}})}function Fn(t,n,a){var s=n.deletions;if(s!==null)for(var l=0;l<s.length;l++){var c=s[l],p=t,E=n,N=E;t:for(;N!==null;){switch(N.tag){case 27:if(qa(N.type)){Je=N.stateNode,qn=!1;break t}break;case 5:Je=N.stateNode,qn=!1;break t;case 3:case 4:Je=N.stateNode.containerInfo,qn=!0;break t}N=N.return}if(Je===null)throw Error(r(160));Eg(p,E,c),Je=null,qn=!1,p=c.alternate,p!==null&&(p.return=null),c.return=null}if(n.subtreeFlags&13886)for(n=n.child;n!==null;)Ag(n,t,a),n=n.sibling}var bi=null;function Ag(t,n,a){var s=t.alternate,l=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(l&4&&(s=t.updateQueue,s=s!==null?s.events:null,s!==null))for(var c=0;c<s.length;c++){var p=s[c];p.ref.impl=p.nextImpl}Fn(n,t,a),Hn(t),l&4&&(Fa(3,t,t.return),Bo(3,t),Fa(5,t,t.return));break;case 1:Fn(n,t,a),Hn(t),l&512&&(Pe||s===null||Rn(s,s.return)),l&64&&xn&&(t=t.updateQueue,t!==null&&(n=t.callbacks,n!==null&&(a=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=a===null?n:a.concat(n))));break;case 26:if(c=bi,Fn(n,t,a),Hn(t),l&512&&(Pe||s===null||Rn(s,s.return)),l&4)if(l=s!==null?s.memoizedState:null,a=t.memoizedState,s===null)if(a===null)if(t.stateNode===null)if(xn)t.stateNode=u0(t.type,t.memoizedProps,n.containerInfo,t);else{t:{n=t.type,a=t.memoizedProps,l=c.ownerDocument||c;e:switch(n){case"title":s=l.getElementsByTagName("title")[0],(!s||s[Ue]||s[Ct]||s.namespaceURI==="http://www.w3.org/2000/svg"||s.hasAttribute("itemprop"))&&(s=l.createElement(n),l.head.insertBefore(s,l.querySelector("head > title"))),Cn(s,n,a),s[Ct]=t,Re(s),n=s;break t;case"link":if(c=L0("link","href",l).get(n+(a.href||""))){for(p=0;p<c.length;p++)if(s=c[p],s.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&s.getAttribute("rel")===(a.rel==null?null:a.rel)&&s.getAttribute("title")===(a.title==null?null:a.title)&&s.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){c.splice(p,1);break e}}s=l.createElement(n),Cn(s,n,a),l.head.appendChild(s);break;case"meta":if(c=L0("meta","content",l).get(n+(a.content||""))){for(p=0;p<c.length;p++)if(s=c[p],s.getAttribute("content")===(a.content==null?null:""+a.content)&&s.getAttribute("name")===(a.name==null?null:a.name)&&s.getAttribute("property")===(a.property==null?null:a.property)&&s.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&s.getAttribute("charset")===(a.charSet==null?null:a.charSet)){c.splice(p,1);break e}}s=l.createElement(n),Cn(s,n,a),l.head.appendChild(s);break;default:throw Error(r(468,n))}s[Ct]=t,Re(s),n=s}t.stateNode=n}else xn||Zh(c,t.type,t.stateNode);else t.stateNode=N0(c,a,t.memoizedProps);else l!==a?(l===null?(n=s.stateNode,n===null||Pe||n.parentNode.removeChild(n)):l.count--,a===null?xn||Zh(c,t.type,t.stateNode):N0(c,a,t.memoizedProps)):a===null&&t.stateNode!==null&&th(t,t.memoizedProps,s.memoizedProps);break;case 27:Fn(n,t,a),Hn(t),l&512&&(Pe||s===null||Rn(s,s.return)),s!==null&&l&4&&th(t,t.memoizedProps,s.memoizedProps);break;case 5:if(c=Vi,Vi=!1,Fn(n,t,a),Vi=c,Hn(t),l&512&&(Pe||s===null||Rn(s,s.return)),t.flags&32){n=t.stateNode;try{$s(n,""),Ce=!0}catch(et){Ie(t,t.return,et)}}l&4&&t.stateNode!=null&&(n=t.memoizedProps,th(t,n,s!==null?s.memoizedProps:n)),l&1024&&(lh=!0);break;case 6:if(Fn(n,t,a),Hn(t),l&4){if(t.stateNode===null)throw Error(r(162));n=t.memoizedProps,a=t.stateNode;try{a.nodeValue=n,Ce=!0}catch(et){Ie(t,t.return,et)}}break;case 3:if(Ce=!1,zu=null,c=bi,bi=Zo(n.containerInfo),Fn(n,t,a),bi=c,Hn(t),l&4&&s!==null&&s.memoizedState.isDehydrated)try{zr(n.containerInfo)}catch(et){Ie(t,t.return,et)}lh&&(lh=!1,Rg(t)),Ce=!1;break;case 4:l=Vi,Vi=xn,s=Wp(),c=bi,bi=Zo(t.stateNode.containerInfo),Fn(n,t,a),Hn(t),bi=c,Ce&&Ho&&(Su=!0),Ce=s,Vi=l;break;case 12:Fn(n,t,a),Hn(t);break;case 31:Fn(n,t,a),Hn(t),l&4&&(n=t.updateQueue,n!==null&&(t.updateQueue=null,xu(t,n)));break;case 13:Fn(n,t,a),Hn(t),t.child.flags&8192&&t.memoizedState!==null!=(s!==null&&s.memoizedState!==null)&&(Tu=G()),l&4&&(n=t.updateQueue,n!==null&&(t.updateQueue=null,xu(t,n)));break;case 22:c=t.memoizedState!==null,p=s!==null&&s.memoizedState!==null;var E=xn,N=Pe,q=Vi;xn=E||c,Vi=q||c,Pe=N||p,Fn(n,t,a),Pe=N,Vi=q,xn=E,Hn(t),l&8192&&(n=t.stateNode,n._visibility=c?n._visibility&-2:n._visibility|1,!c||s===null||p||xn||Pe||(n=p||Pe,a=xn,s=Pe,xn=c||xn,Pe=n,Ha(t,2),xn=a,Pe=s),!c&&Vi||ch(t,c)),l&4&&(n=t.updateQueue,n!==null&&(a=n.retryQueue,a!==null&&(n.retryQueue=null,xu(t,a))));break;case 19:Fn(n,t,a),Hn(t),l&4&&(n=t.updateQueue,n!==null&&(t.updateQueue=null,xu(t,n)));break;case 30:l&512&&(Pe||s===null||Rn(s,s.return)),l=Wp(),c=Ho,p=(a&335544064)===a,E=t.memoizedProps,Ho=p&&sa(E.default,E.update)!=="none",Fn(n,t,a),Hn(t),p&&s!==null&&Ce&&(t.flags|=4),Ho=c,Ce=l;break;case 21:break;case 7:l&512&&(Pe||s===null||Rn(s,s.return)),s&&s.stateNode!==null&&(s.stateNode._fragmentFiber=t);default:Fn(n,t,a),Hn(t)}}function Hn(t){var n=t.flags;if(n&2){try{for(var a,s=t.return;s!==null;){if(fg(s)){a=s;break}s=s.return}s=null;for(var l=t.return;l!==null;){if(Jf(l)){var c=l.stateNode;s===null?s=[c]:s.push(c)}if(Qf(l))break;l=l.return}var p=s;if(a==null)throw Error(r(160));switch(a.tag){case 27:var E=a.stateNode,N=eh(t);mu(t,N,E,p);break;case 5:var q=a.stateNode;a.flags&32&&($s(q,""),a.flags&=-33);var et=eh(t);mu(t,et,q,p);break;case 3:case 4:var pt=a.stateNode.containerInfo,X=eh(t);nh(t,X,pt,p);break;default:throw Error(r(161))}}catch($){Ie(t,t.return,$)}t.flags&=-3}n&4096&&(t.flags&=-4097)}function Rg(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var n=t;Rg(n),n.tag===5&&n.flags&1024&&(n=n.stateNode,Pr=!0,n.reset(),Pr=!1),t=t.sibling}}function vr(t,n){if(n.subtreeFlags&9270)for(n=n.child;n!==null;)Cg(n,t),n=n.sibling;else vg(n)}function Cg(t,n){var a=t.alternate;if(a===null)ih(t,!1);else switch(t.tag){case 3:if(uh=Xi=!1,pg(),vr(n,t),!Xi&&!Su){if(t=Hi,t!==null)for(var s=0;s<t.length;s+=3){a=t[s];var l=t[s+1];m0(a,t[s+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+l+")"})}t=n.containerInfo,t=t.nodeType===9?t.documentElement:t.ownerDocument.documentElement,t!==null&&t.style.viewTransitionName===""&&(t.style.viewTransitionName="none",t.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),t.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),uh=!0}Hi=null;break;case 5:vr(n,t);break;case 4:s=Xi,Xi=!1,vr(n,t),Xi&&(Su=!0),Xi=s;break;case 22:t.memoizedState===null&&(a.memoizedState!==null?ih(t,!1):vr(n,t));break;case 30:s=Xi,l=pg(),Xi=!1,vr(n,t),Xi&&(t.flags|=4);var c=t.memoizedProps,p=t.stateNode;n=aa(c,p),p=aa(a.memoizedProps,p);var E=sa(c.default,c.update);E==="none"?n=!1:(c=a.memoizedState,a.memoizedState=null,a=t.child,Yn=0,n=oh(t,a,n,p,E,c,!0),Yn!==(c===null?0:c.length)&&(t.flags|=32)),(t.flags&4)!==0&&n?(br(t,t.memoizedProps.onUpdate),Hi=l):l!==null&&(l.push.apply(l,Hi),Hi=l),Xi=(t.flags&32)!==0?!0:s;break;default:vr(n,t)}}function ki(t,n){if(n.subtreeFlags&8772)for(n=n.child;n!==null;)yg(t,n.alternate,n),n=n.sibling}function Ha(t,n){for(t=t.child;t!==null;){var a=t,s=n;switch(a.tag){case 0:case 11:case 14:case 15:Fa(4,a,a.return),Ha(a,s);break;case 1:Rn(a,a.return);var l=a.stateNode;typeof l.componentWillUnmount=="function"&&ug(a,a.return,l),Ha(a,s);break;case 27:(s&2)!==0&&R0(a.stateNode,a.type,a.memoizedProps);case 5:Rn(a,a.return),a.tag!==5&&a.tag!==27||Fo(a),Ha(a,s);break;case 6:Fo(a);break;case 26:Rn(a,a.return),l=a.stateNode,a.memoizedState!==null||l===null||Pe||l.parentNode.removeChild(l),Ha(a,s);break;case 22:a.memoizedState===null&&Ha(a,s);break;case 30:Rn(a,a.return),Ha(a,s);break;case 7:Rn(a,a.return);default:Ha(a,s)}t=t.sibling}}function Ai(t,n,a){for(a=(n.subtreeFlags&8772)!==0?a:a&-2,n=n.child;n!==null;){var s=n.alternate,l=t,c=n,p=c.flags,E=(a&1)!==0;switch(c.tag){case 0:case 11:case 15:Ai(l,c,a),Bo(4,c);break;case 1:if(Ai(l,c,a),s=c,l=s.stateNode,typeof l.componentDidMount=="function")try{l.componentDidMount()}catch(et){Ie(s,s.return,et)}if(s=c,l=s.updateQueue,l!==null){var N=s.stateNode;try{var q=l.shared.hiddenCallbacks;if(q!==null)for(l.shared.hiddenCallbacks=null,l=0;l<q.length;l++)Km(q[l],N)}catch(et){Ie(s,s.return,et)}}E&&p&64&&lg(c),Fi(c,c.return);break;case 27:(a&2)!==0&&hg(c);case 5:c.tag!==5&&c.tag!==27||cg(c),Ai(l,c,a),E&&s===null&&p&4&&$f(c),Fi(c,c.return);break;case 6:cg(c);break;case 26:N=c.stateNode,c.memoizedState!==null||N===null||xn||Zh(Zo(N.ownerDocument),c.type,N),Ai(l,c,a),E&&s===null&&p&4&&$f(c),Fi(c,c.return);break;case 12:Ai(l,c,a);break;case 31:Ai(l,c,a),E&&p&4&&Tg(l,c);break;case 13:Ai(l,c,a),E&&p&4&&bg(l,c);break;case 22:c.memoizedState===null&&Ai(l,c,a),Fi(c,c.return);break;case 30:Ai(l,c,a),Fi(c,c.return);break;case 7:Fi(c,c.return);default:Ai(l,c,a)}n=n.sibling}}function hh(t,n){var a=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),t=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(t=n.memoizedState.cachePool.pool),t!==a&&(t!=null&&t.refCount++,a!=null&&bo(a))}function dh(t,n){t=null,n.alternate!==null&&(t=n.alternate.memoizedState.cache),n=n.memoizedState.cache,n!==t&&(n.refCount++,t!=null&&bo(t))}function gi(t,n,a,s){var l=(a&335544064)===a;if(n.subtreeFlags&(l?10262:10256))for(n=n.child;n!==null;)wg(t,n,a,s),n=n.sibling;else l&&gg(n)}function wg(t,n,a,s){var l=(a&335544064)===a;l&&n.alternate===null&&n.return!==null&&n.return.alternate!==null&&vu(n);var c=n.flags;switch(n.tag){case 0:case 11:case 15:gi(t,n,a,s),c&2048&&Bo(9,n);break;case 1:gi(t,n,a,s);break;case 3:gi(t,n,a,s),l&&uh&&(t=t.containerInfo,t=t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,t.style.viewTransitionName==="root"&&(t.style.viewTransitionName=""),t=t.ownerDocument.documentElement,t!==null&&t.style.viewTransitionName==="none"&&(t.style.viewTransitionName="")),c&2048&&(c=null,n.alternate!==null&&(c=n.alternate.memoizedState.cache),n=n.memoizedState.cache,n!==c&&(n.refCount++,c!=null&&bo(c)));break;case 12:if(c&2048){gi(t,n,a,s),c=n.stateNode;try{var p=n.memoizedProps,E=p.id,N=p.onPostCommit;typeof N=="function"&&N(E,n.alternate===null?"mount":"update",c.passiveEffectDuration,-0)}catch(q){Ie(n,n.return,q)}}else gi(t,n,a,s);break;case 31:gi(t,n,a,s);break;case 13:gi(t,n,a,s);break;case 23:break;case 22:p=n.stateNode,E=n.alternate,n.memoizedState!==null?(l&&E!==null&&E.memoizedState===null&&vu(E),p._visibility&2?gi(t,n,a,s):Go(t,n)):(l&&E!==null&&E.memoizedState!==null&&vu(n),p._visibility&2?gi(t,n,a,s):(p._visibility|=2,Sr(t,n,a,s,(n.subtreeFlags&10256)!==0||!1))),c&2048&&hh(E,n);break;case 24:gi(t,n,a,s),c&2048&&dh(n.alternate,n);break;case 30:l&&(c=n.alternate,c!==null&&(Gi(c.child,!0),Gi(n.child,!0))),gi(t,n,a,s);break;default:gi(t,n,a,s)}}function Sr(t,n,a,s,l){for(l=l&&((n.subtreeFlags&10256)!==0||!1),n=n.child;n!==null;){var c=t,p=n,E=a,N=s,q=p.flags;switch(p.tag){case 0:case 11:case 15:Sr(c,p,E,N,l),Bo(8,p);break;case 23:break;case 22:var et=p.stateNode;p.memoizedState!==null?et._visibility&2?Sr(c,p,E,N,l):Go(c,p):(et._visibility|=2,Sr(c,p,E,N,l)),l&&q&2048&&hh(p.alternate,p);break;case 24:Sr(c,p,E,N,l),l&&q&2048&&dh(p.alternate,p);break;default:Sr(c,p,E,N,l)}n=n.sibling}}function Go(t,n){if(n.subtreeFlags&10256)for(n=n.child;n!==null;){var a=t,s=n,l=s.flags;switch(s.tag){case 22:Go(a,s),l&2048&&hh(s.alternate,s);break;case 24:Go(a,s),l&2048&&dh(s.alternate,s);break;default:Go(a,s)}n=n.sibling}}var Ds=8192;function Us(t,n,a){if(t.subtreeFlags&Ds)for(t=t.child;t!==null;)Dg(t,n,a),t=t.sibling}function Dg(t,n,a){switch(t.tag){case 26:Us(t,n,a),t.flags&Ds&&(t.memoizedState!==null?dM(a,bi,t.memoizedState,t.memoizedProps):(t=t.stateNode,(n&335544128)===n&&I0(a,t)));break;case 5:Us(t,n,a),t.flags&Ds&&(t=t.stateNode,(n&335544128)===n&&I0(a,t));break;case 3:case 4:var s=bi;bi=Zo(t.stateNode.containerInfo),Us(t,n,a),bi=s;break;case 22:t.memoizedState===null&&(s=t.alternate,s!==null&&s.memoizedState!==null?(s=Ds,Ds=16777216,Us(t,n,a),Ds=s):Us(t,n,a));break;case 30:if((t.flags&Ds)!==0&&(s=t.memoizedProps.name,s!=null&&s!=="auto")){var l=t.stateNode;l.paired=null,ei===null&&(ei=new Map),ei.set(s,l)}Us(t,n,a);break;default:Us(t,n,a)}}function Ug(t){var n=t.alternate;if(n!==null&&(t=n.child,t!==null)){n.child=null;do n=t.sibling,t.sibling=null,t=n;while(t!==null)}}function Vo(t){var n=t.deletions;if((t.flags&16)!==0){if(n!==null)for(var a=0;a<n.length;a++){var s=n[a];Mn=s,Lg(s,t)}Ug(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)Ng(t),t=t.sibling}function Ng(t){switch(t.tag){case 0:case 11:case 15:Vo(t),t.flags&2048&&Fa(9,t,t.return);break;case 3:Vo(t);break;case 12:Vo(t);break;case 22:var n=t.stateNode;t.memoizedState!==null&&n._visibility&2&&(t.return===null||t.return.tag!==13)?(n._visibility&=-3,Mu(t)):Vo(t);break;default:Vo(t)}}function Mu(t){var n=t.deletions;if((t.flags&16)!==0){if(n!==null)for(var a=0;a<n.length;a++){var s=n[a];Mn=s,Lg(s,t)}Ug(t)}for(t=t.child;t!==null;){switch(n=t,n.tag){case 0:case 11:case 15:Fa(8,n,n.return),Mu(n);break;case 22:a=n.stateNode,a._visibility&2&&(a._visibility&=-3,Mu(n));break;default:Mu(n)}t=t.sibling}}function Lg(t,n){for(;Mn!==null;){var a=Mn;switch(a.tag){case 0:case 11:case 15:Fa(8,a,n);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var s=a.memoizedState.cachePool.pool;s!=null&&s.refCount++}break;case 24:bo(a.memoizedState.cache)}if(s=a.child,s!==null)s.return=a,Mn=s;else t:for(a=t;Mn!==null;){s=Mn;var l=s.sibling,c=s.return;if(Mg(s),s===a){Mn=null;break t}if(l!==null){l.return=c,Mn=l;break t}Mn=c}}}var lx={getCacheForType:function(t){var n=Tn(un),a=n.data.get(t);return a===void 0&&(a=t(),n.data.set(t,a)),a},cacheSignal:function(){return Tn(un).controller.signal}},ux=typeof WeakMap=="function"?WeakMap:Map,Le=0,Ye=null,Se=null,Me=0,ze=0,ni=null,Ga=!1,yr=!1,ph=!1,pa=0,an=0,Va=0,Ns=0,Eu=0,ii=0,xr=0,Xo=null,Wn=null,mh=!1,Tu=0,Og=0,bu=1/0,Au=null,Xa=null,tn=0,Ri=null,Ls=null,Yi=0,_h=0,gh=null,Pg=null,Mr=null,Er=null,Tr=null,ko=0,Ru=null;function ai(){return(Le&2)!==0&&Me!==0?Me&-Me:Mt.T!==null?Rh():Et()}function zg(){if(ii===0)if((Me&536870912)===0||_e){var t=ea;ea<<=1,(ea&3932160)===0&&(ea=262144),ii=t}else ii=536870912;return t=bn.current,t!==null&&(t.flags|=32),ii}function br(t,n){if(n!=null){var a=t.stateNode,s=a.ref;s===null&&(s=a.ref=_0(aa(t.memoizedProps,a))),Er===null&&(Er=[]),Er.push(n.bind(null,s))}}function jn(t,n,a){(t===Ye&&(ze===2||ze===9)||t.cancelPendingCommit!==null)&&(Ar(t,0),ka(t,Me,ii,!1)),ps(t,a),((Le&2)===0||t!==Ye)&&(t===Ye&&((Le&2)===0&&(Ns|=a),an===4&&ka(t,Me,ii,!1)),qi(t))}function Ig(t,n,a){if((Le&6)!==0)throw Error(r(327));var s=!a&&(n&127)===0&&(n&t.expiredLanes)===0||Ta(t,n),l=s?hx(t,n):Sh(t,n,!0),c=s;do{if(l===0){yr&&!s&&ka(t,n,0,!1);break}else{if(a=t.current.alternate,c&&!cx(a)){l=Sh(t,n,!1),c=!1;continue}if(l===2){if(c=n,t.errorRecoveryDisabledLanes&c)var p=0;else p=t.pendingLanes&-536870913,p=p!==0?p:p&536870912?536870912:0;if(p!==0){n=p;t:{var E=t;l=Xo;var N=E.current.memoizedState.isDehydrated;if(N&&(Ar(E,p).flags|=256),p=Sh(E,p,!1),p!==2&&p!==6){if(ph&&!N){E.errorRecoveryDisabledLanes|=c,Ns|=c,l=4;break t}c=Wn,Wn=l,c!==null&&(Wn===null?Wn=c:Wn.push.apply(Wn,c))}l=p}if(c=!1,l!==2)continue}}if(l===1){Ar(t,0),ka(t,n,0,!0);break}t:{switch(s=t,c=l,c){case 0:case 1:throw Error(r(345));case 4:if((n&4194048)!==n&&(n&62914560)!==n)break;case 6:ka(s,n,ii,!Ga);break t;case 2:Wn=null;break;case 3:case 5:break;default:throw Error(r(329))}if((n&62914560)===n&&(l=Tu+300-G(),10<l)){if(ka(s,n,ii,!Ga),ds(s,0,!0)!==0)break t;Yi=n,s.timeoutHandle=Bh(Bg.bind(null,s,a,Wn,Au,mh,n,ii,Ns,xr,Ga,c,"Throttled",-0,0),l);break t}Bg(s,a,Wn,Au,mh,n,ii,Ns,xr,Ga,c,null,-0,0)}}break}while(!0);qi(t)}function Bg(t,n,a,s,l,c,p,E,N,q,et,pt,X,$){t.timeoutHandle=-1;var Dt=n.subtreeFlags,kt=(c&335544064)===c;if(pt=null,(kt||Dt&8192||(Dt&16785408)===16785408)&&(pt={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:zi},ei=null,Dg(n,c,pt),kt&&(Dt=pt,kt=t.containerInfo,kt=(kt.nodeType===9?kt:kt.ownerDocument).__reactViewTransition,kt!=null&&(Dt.count++,Dt.waitingForViewTransition=!0,Dt=Jo.bind(Dt),kt.finished.then(Dt,Dt))),Dt=(c&62914560)===c?Tu-G():(c&4194048)===c?Og-G():0,Dt=pM(pt,Dt),Dt!==null)){Yi=c,t.cancelPendingCommit=Dt(qg.bind(null,t,n,c,a,s,l,p,E,N,q,et,pt,null,X,$)),ka(t,c,p,!q);return}qg(t,n,c,a,s,l,p,E,N,q,et,pt)}function cx(t){for(var n=t;;){var a=n.tag;if((a===0||a===11||a===15)&&n.flags&16384&&(a=n.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var s=0;s<a.length;s++){var l=a[s],c=l.getSnapshot;l=l.value;try{if(!$n(c(),l))return!1}catch{return!1}}if(a=n.child,n.subtreeFlags&16384&&a!==null)a.return=n,n=a;else{if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return!0;n=n.return}n.sibling.return=n.return,n=n.sibling}}return!0}function ka(t,n,a,s){n=Tl(t,n),n&=~Eu,n&=~Ns,t.suspendedLanes|=n,t.pingedLanes&=~n,s&&(t.warmLanes|=n),s=t.expirationTimes;for(var l=n;0<l;){var c=31-Un(l),p=1<<c;s[c]=-1,l&=~p}a!==0&&b(t,a,n)}function Cu(){return(Le&6)===0?(Yo(0),!1):!0}function vh(){if(Se!==null){if(ze===0)var t=Se.return;else t=Se,la=ys=null,Af(t),hr=null,Co=0,t=Se;for(;t!==null;)og(t.alternate,t),t=t.return;Se=null}}function Ar(t,n){var a=t.timeoutHandle;return a!==-1&&(t.timeoutHandle=-1,Ox(a)),a=t.cancelPendingCommit,a!==null&&(t.cancelPendingCommit=null,a()),Yi=0,vh(),Ye=t,Se=a=ra(t.current,null),Me=n,ze=0,ni=null,Ga=!1,yr=Ta(t,n),ph=!1,xr=ii=Eu=Ns=Va=an=0,Wn=Xo=null,mh=!1,pa=Tl(t,n),zl(),a}function Fg(t,n){fe=null,Mt.H=ou,n===fr||n===Wl?(n=qm(),ze=3):n===df?(n=qm(),ze=4):ze=n===Gf?8:n!==null&&typeof n=="object"&&typeof n.then=="function"?6:1,ni=n,Se===null&&(an=1,lu(t,di(n,t.current)))}function Hg(){var t=bn.current;return t===null?!0:(Me&4194048)===Me?Ln===null:(Me&62914560)===Me||(Me&536870912)!==0?t===Ln:!1}function Gg(){var t=Mt.H;return Mt.H=ou,t===null?ou:t}function Vg(){var t=Mt.A;return Mt.A=lx,t}function wu(){an=4,Ga||(Me&4194048)!==Me&&bn.current!==null||(yr=!0),(Va&134217727)===0&&(Ns&134217727)===0||Ye===null||ka(Ye,Me,ii,!1)}function Sh(t,n,a){var s=Le;Le|=2;var l=Gg(),c=Vg();(Ye!==t||Me!==n)&&(Au=null,Ar(t,n)),n=!1;var p=an;t:do try{if(ze!==0&&Se!==null){var E=Se,N=ni;switch(ze){case 8:vh(),p=6;break t;case 3:case 2:case 9:case 6:bn.current===null&&(n=!0);var q=ze;if(ze=0,ni=null,Rr(t,E,N,q),a&&yr){p=0;break t}break;default:q=ze,ze=0,ni=null,Rr(t,E,N,q)}}fx(),p=an;break}catch(et){Fg(t,et)}while(!0);return n&&t.shellSuspendCounter++,la=ys=null,Le=s,Mt.H=l,Mt.A=c,Se===null&&(Ye=null,Me=0,zl()),p}function fx(){for(;Se!==null;)Xg(Se)}function hx(t,n){var a=Le;Le|=2;var s=Gg(),l=Vg();Ye!==t||Me!==n?(Au=null,bu=G()+500,Ar(t,n)):yr=Ta(t,n);t:do try{if(ze!==0&&Se!==null){n=Se;var c=ni;e:switch(ze){case 1:ze=0,ni=null,Rr(t,n,c,1);break;case 2:case 9:if(km(c)){ze=0,ni=null,kg(n);break}n=function(){ze!==2&&ze!==9||Ye!==t||(ze=7),qi(t)},c.then(n,n);break t;case 3:ze=7;break t;case 4:ze=5;break t;case 7:km(c)?(ze=0,ni=null,kg(n)):(ze=0,ni=null,Rr(t,n,c,7));break;case 5:var p=null;switch(Se.tag){case 26:p=Se.memoizedState;case 5:case 27:var E=Se;if(p?P0(p):E.stateNode.complete){ze=0,ni=null;var N=E.sibling;if(N!==null)Se=N;else{var q=E.return;q!==null?(Se=q,Du(q)):Se=null}break e}}ze=0,ni=null,Rr(t,n,c,5);break;case 6:ze=0,ni=null,Rr(t,n,c,6);break;case 8:vh(),an=6;break t;default:throw Error(r(462))}}dx();break}catch(et){Fg(t,et)}while(!0);return la=ys=null,Mt.H=s,Mt.A=l,Le=a,Se!==null?0:(Ye=null,Me=0,zl(),an)}function dx(){for(;Se!==null&&!Ot();)Xg(Se)}function Xg(t){var n=sg(t.alternate,t,pa);t.memoizedProps=t.pendingProps,n===null?Du(t):Se=n}function kg(t){var n=t,a=n.alternate;switch(n.tag){case 15:case 0:n=J_(a,n,n.pendingProps,n.type,void 0,Me);break;case 11:n=J_(a,n,n.pendingProps,n.type.render,n.ref,Me);break;case 5:Af(n);var s=n;s===yn&&(_e?(Vl(s),s.tag===5&&s.stateNode!=null&&(je=s.stateNode)):(Vl(s),_e=!0));default:og(a,n),n=Se=Lm(n,pa),n=sg(a,n,pa)}t.memoizedProps=t.pendingProps,n===null?Du(t):Se=n}function Rr(t,n,a,s){la=ys=null,Af(n),hr=null,Co=0;var l=n.return;try{if(tx(t,l,n,a,Me)){an=1,lu(t,di(a,t.current)),Se=null;return}}catch(c){if(l!==null)throw Se=l,c;an=1,lu(t,di(a,t.current)),Se=null;return}n.flags&32768?(_e||s===1?t=!0:yr||(Me&536870912)!==0?t=!1:(Ga=t=!0,(s===2||s===9||s===3||s===6)&&(s=bn.current,s!==null&&s.tag===13&&(s.flags|=16384))),Yg(n,t)):Du(n)}function Du(t){var n=t;do{if((n.flags&32768)!==0){Yg(n,Ga);return}t=n.return;var a=ax(n.alternate,n,pa);if(a!==null){Se=a;return}if(n=n.sibling,n!==null){Se=n;return}Se=n=t}while(n!==null);an===0&&(an=5)}function Yg(t,n){do{var a=sx(t.alternate,t);if(a!==null){a.flags&=32767,Se=a;return}if(a=t.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!n&&(t=t.sibling,t!==null)){Se=t;return}Se=t=a}while(t!==null);an=6,Se=null}function qg(t,n,a,s,l,c,p,E,N,q,et,pt){t.cancelPendingCommit=null;do Uu();while(tn!==0);if((Le&6)!==0)throw Error(r(327));if(n!==null){if(n===t.current)throw Error(r(177));t===Ye&&(Se=Ye=null,Me=0),Ls=n,Ri=t,Yi=a,gh=l,Pg=s,px(t,n,a,p,E,N,pt)}}function px(t,n,a,s,l,c,p){var E=n.lanes|n.childLanes;if(_h=E,E|=$c,Dc(t,a,E,s,l,c),Er=null,(a&335544064)===a?(Tr=Vy(t),s=10262):(Tr=null,s=10256),(n.subtreeFlags&s)!==0||(n.flags&s)!==0?(t.callbackNode=null,t.callbackPriority=0,yx(yt,function(){return Eh(),null})):(t.callbackNode=null,t.callbackPriority=0),_u=!1,s=(n.flags&13878)!==0,(n.subtreeFlags&13878)!==0||s){s=Mt.T,Mt.T=null,l=Yt.p,Yt.p=2,c=Le,Le|=4;try{rx(t,n,a)}finally{Le=c,Yt.p=l,Mt.T=s}}tn=1,_u?Mr=Hx(p,t.containerInfo,Tr,yh,xh,_x,Mh,Eh,mx):(yh(),xh(),Mh())}function mx(t){if(tn!==0){var n=Ri.onRecoverableError;n(t,{componentStack:null})}}function _x(){tn===3&&(tn=0,Cg(Ls,Ri),tn=4)}function yh(){if(tn===1){tn=0;var t=Ri,n=Ls,a=Yi,s=(n.flags&13878)!==0;if((n.subtreeFlags&13878)!==0||s){s=Mt.T,Mt.T=null;var l=Yt.p;Yt.p=2;var c=Le;Le|=4;try{Ho=Su=!1,Ag(n,t,a),a=Ph;var p=Em(t.containerInfo),E=a.focusedElem,N=a.selectionRange;if(p!==E&&E&&E.ownerDocument&&Mm(E.ownerDocument.documentElement,E)){if(N!==null&&jc(E)){var q=N.start,et=N.end;if(et===void 0&&(et=q),"selectionStart"in E)E.selectionStart=q,E.selectionEnd=Math.min(et,E.value.length);else{var pt=E.ownerDocument||document,X=pt&&pt.defaultView||window;if(X.getSelection){var $=X.getSelection(),Dt=E.textContent.length,kt=Math.min(N.start,Dt),he=N.end===void 0?kt:Math.min(N.end,Dt);!$.extend&&kt>he&&(p=he,he=kt,kt=p);var Y=xm(E,kt),F=xm(E,he);if(Y&&F&&($.rangeCount!==1||$.anchorNode!==Y.node||$.anchorOffset!==Y.offset||$.focusNode!==F.node||$.focusOffset!==F.offset)){var Q=pt.createRange();Q.setStart(Y.node,Y.offset),$.removeAllRanges(),kt>he?($.addRange(Q),$.extend(F.node,F.offset)):(Q.setEnd(F.node,F.offset),$.addRange(Q))}}}}for(pt=[],$=E;$=$.parentNode;)$.nodeType===1&&pt.push({element:$,left:$.scrollLeft,top:$.scrollTop});for(typeof E.focus=="function"&&E.focus(),E=0;E<pt.length;E++){var ht=pt[E];ht.element.scrollLeft=ht.left,ht.element.scrollTop=ht.top}}Pr=!!Oh,Ph=Oh=null}finally{Le=c,Yt.p=l,Mt.T=s}}t.current=n,tn=2}}function xh(){if(tn===2){tn=0;var t=Ri,n=Ls,a=(n.flags&8772)!==0;if((n.subtreeFlags&8772)!==0||a){a=Mt.T,Mt.T=null;var s=Yt.p;Yt.p=2;var l=Le;Le|=4;try{yg(t,n.alternate,n)}finally{Le=l,Yt.p=s,Mt.T=a}}tn=3}}function Mh(){if(tn===4||tn===3){tn=0;var t=Mr;Mr=null,ue();var n=Ri,a=Ls,s=Yi,l=Pg,c=(s&335544064)===s?10262:10256;if((a.subtreeFlags&c)!==0||(a.flags&c)!==0?tn=5:(tn=0,Ls=Ri=null,Wg(n,n.pendingLanes)),c=n.pendingLanes,c===0&&(Xa=null),K(s),a=a.stateNode,$e&&typeof $e.onCommitFiberRoot=="function")try{$e.onCommitFiberRoot(xe,a,void 0,(a.current.flags&128)===128)}catch{}if(l!==null){a=Mt.T,c=Yt.p,Yt.p=2,Mt.T=null;try{for(var p=n.onRecoverableError,E=0;E<l.length;E++){var N=l[E];p(N.value,{componentStack:N.stack})}}finally{Mt.T=a,Yt.p=c}}if(l=Er,p=Tr,Tr=null,l!==null&&(Er=null,p===null&&(p=[]),t!==null))for(N=0;N<l.length;N++)a=(0,l[N])(p),a!==void 0&&t.finished.finally(a);(Yi&3)!==0&&Uu(),qi(n),c=n.pendingLanes,(s&261930)!==0&&(c&42)!==0?n===Ru?ko++:(ko=0,Ru=n):(ko=0,Ru=null),Yo(0)}}function Wg(t,n){(t.pooledCacheLanes&=n)===0&&(n=t.pooledCache,n!=null&&(t.pooledCache=null,bo(n)))}function Uu(){return Mr!==null&&(Mr.skipTransition(),Mr=null),yh(),xh(),Mh(),Eh()}function Eh(){if(tn!==5)return!1;var t=Ri,n=_h;_h=0;var a=K(Yi),s=Mt.T,l=Yt.p;try{Yt.p=32>a?32:a,Mt.T=null,a=gh,gh=null;var c=Ri,p=Yi;if(tn=0,Ls=Ri=null,Yi=0,(Le&6)!==0)throw Error(r(331));var E=Le;if(Le|=4,Ng(c.current),wg(c,c.current,p,a),Le=E,Yo(0,!1),$e&&typeof $e.onPostCommitFiberRoot=="function")try{$e.onPostCommitFiberRoot(xe,c)}catch{}return!0}finally{Yt.p=l,Mt.T=s,Wg(t,n)}}function jg(t,n,a){n=di(a,n),n=Hf(t.stateNode,n,2),t=Pa(t,n,2),t!==null&&(ps(t,2),qi(t))}function Ie(t,n,a){if(t.tag===3)jg(t,t,a);else for(;n!==null;){if(n.tag===3){jg(n,t,a);break}else if(n.tag===1){var s=n.stateNode;if(typeof n.type.getDerivedStateFromError=="function"||typeof s.componentDidCatch=="function"&&(Xa===null||!Xa.has(s))){t=di(a,t),a=k_(2),s=Pa(n,a,2),s!==null&&(Y_(a,s,n,t),ps(s,2),qi(s));break}}n=n.return}}function Th(t,n,a){var s=t.pingCache;if(s===null){s=t.pingCache=new ux;var l=new Set;s.set(n,l)}else l=s.get(n),l===void 0&&(l=new Set,s.set(n,l));l.has(a)||(ph=!0,l.add(a),t=gx.bind(null,t,n,a),n.then(t,t))}function gx(t,n,a){var s=t.pingCache;s!==null&&s.delete(n),t.pingedLanes|=t.suspendedLanes&a,t.warmLanes&=~a,Ye===t&&(Me&a)===a&&((an===4||an===3&&(Me&62914560)===Me&&300>G()-Tu)&&(Le&2)===0?Ar(t,0):Eu|=a,xr===Me&&(xr=0)),qi(t)}function Zg(t,n){n===0&&(n=bl()),t=gs(t,n),t!==null&&(ps(t,n),qi(t))}function vx(t){var n=t.memoizedState,a=0;n!==null&&(a=n.retryLane),Zg(t,a)}function Sx(t,n){var a=0;switch(t.tag){case 31:case 13:var s=t.stateNode,l=t.memoizedState;l!==null&&(a=l.retryLane);break;case 19:s=t.stateNode;break;case 22:s=t.stateNode._retryCache;break;default:throw Error(r(314))}s!==null&&s.delete(n),Zg(t,a)}function yx(t,n){return ee(t,n)}var Cr=null,wr=null,bh=!1,Nu=!1,Ah=!1,Ya=0;function qi(t){t!==wr&&t.next===null&&(wr===null?Cr=wr=t:wr=wr.next=t),Nu=!0,bh||(bh=!0,Mx())}function Yo(t,n){if(!Ah&&Nu){Ah=!0;do for(var a=!1,s=Cr;s!==null;){if(t!==0){var l=s.pendingLanes;if(l===0)var c=0;else{var p=s.suspendedLanes,E=s.pingedLanes;c=(1<<31-Un(42|t)+1)-1,c&=l&~(p&~E),c=c&201326741?c&201326741|1:c?c|2:0}c!==0&&(a=!0,$g(s,c))}else c=Me,c=ds(s,s===Ye?c:0,s.cancelPendingCommit!==null||s.timeoutHandle!==-1),(c&3)===0||Ta(s,c)||(a=!0,$g(s,c));s=s.next}while(a);Ah=!1}}function xx(){Kg()}function Kg(){Nu=bh=!1;var t=0;Ya!==0&&Lx()&&(t=Ya);for(var n=G(),a=null,s=Cr;s!==null;){var l=s.next,c=Qg(s,n);c===0?(s.next=null,a===null?Cr=l:a.next=l,l===null&&(wr=a)):(a=s,(t!==0||(c&3)!==0)&&(Nu=!0)),s=l}tn!==0&&tn!==5||Yo(t),Ya!==0&&(Ya=0)}function Qg(t,n){for(var a=t.suspendedLanes,s=t.pingedLanes,l=t.expirationTimes,c=t.pendingLanes&-62914561;0<c;){var p=31-Un(c),E=1<<p,N=l[p];N===-1?((E&a)===0||(E&s)!==0)&&(l[p]=wc(E,n)):N<=n&&(t.expiredLanes|=E),c&=~E}if(n=Ye,a=Me,a=ds(t,t===n?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),s=t.callbackNode,a===0||t===n&&(ze===2||ze===9)||t.cancelPendingCommit!==null)return s!==null&&s!==null&&jt(s),t.callbackNode=null,t.callbackPriority=0;if((a&3)===0||Ta(t,a)){if(n=a&-a,n===t.callbackPriority)return n;switch(s!==null&&jt(s),K(a)){case 2:case 8:a=Gt;break;case 32:a=yt;break;case 268435456:a=qt;break;default:a=yt}return s=Jg.bind(null,t),a=ee(a,s),t.callbackPriority=n,t.callbackNode=a,n}return s!==null&&s!==null&&jt(s),t.callbackPriority=2,t.callbackNode=null,2}function Jg(t,n){if(tn!==0&&tn!==5)return t.callbackNode=null,t.callbackPriority=0,null;var a=t.callbackNode;if(Uu()&&t.callbackNode!==a)return null;var s=Me;return s=ds(t,t===Ye?s:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),s===0?null:(Ig(t,s,n),Qg(t,G()),t.callbackNode!=null&&t.callbackNode===a?Jg.bind(null,t):null)}function $g(t,n){if(Uu())return null;Ig(t,n,!0)}function Mx(){Px(function(){(Le&6)!==0?ee(wt,xx):Kg()})}function Rh(){if(Ya===0){var t=Es;t===0&&(t=fs,fs<<=1,(fs&261888)===0&&(fs=256)),Ya=t}return Ya}function t0(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:Cl(t)}function Ex(t,n,a,s,l){if(n==="submit"&&a&&a.stateNode===l){var c=t0((l[Xt]||null).action),p=s.submitter;p&&(n=(n=p[Xt]||null)?t0(n.formAction):p.getAttribute("formAction"),n!==null&&(c=n,p=null));var E=new Nl("action","action",null,s,l);t.push({event:E,listeners:[{instance:null,listener:function(){if(s.defaultPrevented){if(Ya!==0){var N=new FormData(l,p);Pf(a,{pending:!0,data:N,method:l.method,action:c},null,N)}}else typeof c=="function"&&(E.preventDefault(),N=new FormData(l,p),Pf(a,{pending:!0,data:N,method:l.method,action:c},c,N))},currentTarget:l}]})}}for(var Ch=0;Ch<Jc.length;Ch++){var wh=Jc[Ch],Tx=wh.toLowerCase(),bx=wh[0].toUpperCase()+wh.slice(1);Ei(Tx,"on"+bx)}Ei(Am,"onAnimationEnd"),Ei(Rm,"onAnimationIteration"),Ei(Cm,"onAnimationStart"),Ei("dblclick","onDoubleClick"),Ei("focusin","onFocus"),Ei("focusout","onBlur"),Ei(Oy,"onTransitionRun"),Ei(Py,"onTransitionStart"),Ei(zy,"onTransitionCancel"),Ei(wm,"onTransitionEnd"),en("onMouseEnter",["mouseout","mouseover"]),en("onMouseLeave",["mouseout","mouseover"]),en("onPointerEnter",["pointerout","pointerover"]),en("onPointerLeave",["pointerout","pointerover"]),ln("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),ln("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),ln("onBeforeInput",["compositionend","keypress","textInput","paste"]),ln("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),ln("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),ln("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var qo="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),Ax=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(qo));function e0(t,n){n=(n&4)!==0;for(var a=0;a<t.length;a++){var s=t[a],l=s.event;s=s.listeners;t:{var c=void 0;if(n)for(var p=s.length-1;0<=p;p--){var E=s[p],N=E.instance,q=E.currentTarget;if(E=E.listener,N!==c&&l.isPropagationStopped())break t;c=E,l.currentTarget=q;try{c(l)}catch(et){Pl(et)}l.currentTarget=null,c=N}else for(p=0;p<s.length;p++){if(E=s[p],N=E.instance,q=E.currentTarget,E=E.listener,N!==c&&l.isPropagationStopped())break t;c=E,l.currentTarget=q;try{c(l)}catch(et){Pl(et)}l.currentTarget=null,c=N}}}}function ye(t,n){var a=n[Jt];a===void 0&&(a=n[Jt]=new Set);var s=t+"__bubble";a.has(s)||(n0(n,t,2,!1),a.add(s))}function Dh(t,n,a){var s=0;n&&(s|=4),n0(a,t,s,n)}var Lu="_reactListening"+Math.random().toString(36).slice(2);function Uh(t){if(!t[Lu]){t[Lu]=!0,We.forEach(function(a){a!=="selectionchange"&&(Ax.has(a)||Dh(a,!1,t),Dh(a,!0,t))});var n=t.nodeType===9?t:t.ownerDocument;n===null||n[Lu]||(n[Lu]=!0,Dh("selectionchange",!1,n))}}function n0(t,n,a,s){switch(Y0(n)){case 2:var l=vM;break;case 8:l=SM;break;default:l=Qh}a=l.bind(null,n,a,t),l=void 0,!Bc||n!=="touchstart"&&n!=="touchmove"&&n!=="wheel"||(l=!0),s?l!==void 0?t.addEventListener(n,a,{capture:!0,passive:l}):t.addEventListener(n,a,!0):l!==void 0?t.addEventListener(n,a,{passive:l}):t.addEventListener(n,a,!1)}function Nh(t,n,a,s,l){var c=s;if((n&1)===0&&(n&2)===0&&s!==null)t:for(;;){if(s===null)return;var p=s.tag;if(p===3||p===4){var E=s.stateNode.containerInfo;if(E===l)break;if(p===4)for(p=s.return;p!==null;){var N=p.tag;if((N===3||N===4)&&p.stateNode.containerInfo===l)return;p=p.return}for(;E!==null;){if(p=Ne(E),p===null)return;if(N=p.tag,N===5||N===6||N===26||N===27){s=c=p;continue t}E=E.parentNode}}s=s.return}nm(function(){var q=c,et=zc(a),pt=[];t:{var X=Dm.get(t);if(X!==void 0){var $=Nl,Dt=t;switch(t){case"keypress":if(Dl(a)===0)break t;case"keydown":case"keyup":$=cy;break;case"focusin":Dt="focus",$=Vc;break;case"focusout":Dt="blur",$=Vc;break;case"beforeblur":case"afterblur":$=Vc;break;case"click":if(a.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":$=sm;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":$=JS;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":$=my;break;case Am:case Rm:case Cm:$=ey;break;case wm:$=gy;break;case"scroll":case"scrollend":$=KS;break;case"wheel":$=Sy;break;case"copy":case"cut":case"paste":$=iy;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":$=om;break;case"submit":$=dy;break;case"toggle":case"beforetoggle":$=xy}var kt=(n&4)!==0,he=!kt&&(t==="scroll"||t==="scrollend"),Y=kt?X!==null?X+"Capture":null:X;kt=[];for(var F=q,Q;F!==null;){var ht=F;if(Q=ht.stateNode,ht=ht.tag,ht!==5&&ht!==26&&ht!==27||Q===null||Y===null||(ht=po(F,Y),ht!=null&&kt.push(Wo(F,ht,Q))),he)break;F=F.return}0<kt.length&&(X=new $(X,Dt,null,a,et),pt.push({event:X,listeners:kt}))}}if((n&7)===0){t:{if($=t==="mouseover"||t==="pointerover",X=t==="mouseout"||t==="pointerout",$&&a!==Pc&&(Dt=a.relatedTarget||a.fromElement)&&(Ne(Dt)||Dt[te]))break t;(X||$)&&(Dt=et.window===et?et:($=et.ownerDocument)?$.defaultView||$.parentWindow:window,X?($=a.relatedTarget||a.toElement,X=q,$=$?Ne($):null,$!==null&&(he=f($),kt=$.tag,$!==he||kt!==5&&kt!==27&&kt!==6)&&($=null)):(X=null,$=q),X!==$&&(kt=sm,ht="onMouseLeave",Y="onMouseEnter",F="mouse",(t==="pointerout"||t==="pointerover")&&(kt=om,ht="onPointerLeave",Y="onPointerEnter",F="pointer"),he=X==null?Dt:mn(X),Q=$==null?Dt:mn($),Dt=new kt(ht,F+"leave",X,a,et),Dt.target=he,Dt.relatedTarget=Q,ht=null,Ne(et)===q&&(kt=new kt(Y,F+"enter",$,a,et),kt.target=Q,kt.relatedTarget=he,ht=kt),he=ht,kt=X&&$?B(X,$,Rx):null,X!==null&&i0(pt,Dt,X,kt,!1),$!==null&&he!==null&&i0(pt,he,$,kt,!0)))}t:{if(X=q?mn(q):window,$=X.nodeName&&X.nodeName.toLowerCase(),$==="select"||$==="input"&&X.type==="file")var Ft=mm;else if(dm(X))if(_m)Ft=Uy;else{Ft=wy;var Ee=Cy}else $=X.nodeName,!$||$.toLowerCase()!=="input"||X.type!=="checkbox"&&X.type!=="radio"?q&&Oc(q.elementType)&&(Ft=mm):Ft=Dy;if(Ft&&(Ft=Ft(t,q))){pm(pt,Ft,a,et);break t}Ee&&Ee(t,X,q)}switch(Ee=q?mn(q):window,t){case"focusin":(dm(Ee)||Ee.contentEditable==="true")&&(ir=Ee,Zc=q,Mo=null);break;case"focusout":Mo=Zc=ir=null;break;case"mousedown":Kc=!0;break;case"contextmenu":case"mouseup":case"dragend":Kc=!1,Tm(pt,a,et);break;case"selectionchange":if(Ly)break;case"keydown":case"keyup":Tm(pt,a,et)}var Qt;if(kc)t:{switch(t){case"compositionstart":var ie="onCompositionStart";break t;case"compositionend":ie="onCompositionEnd";break t;case"compositionupdate":ie="onCompositionUpdate";break t}ie=void 0}else nr?fm(t,a)&&(ie="onCompositionEnd"):t==="keydown"&&a.keyCode===229&&(ie="onCompositionStart");ie&&(lm&&a.locale!=="ko"&&(nr||ie!=="onCompositionStart"?ie==="onCompositionEnd"&&nr&&(Qt=im()):(Aa=et,Fc="value"in Aa?Aa.value:Aa.textContent,nr=!0)),Ee=Ou(q,ie),0<Ee.length&&(ie=new rm(ie,t,null,a,et),pt.push({event:ie,listeners:Ee}),Qt?ie.data=Qt:(Qt=hm(a),Qt!==null&&(ie.data=Qt)))),(Qt=Ey?Ty(t,a):by(t,a))&&(ie=Ou(q,"onBeforeInput"),0<ie.length&&(Ee=new rm("onBeforeInput","beforeinput",null,a,et),pt.push({event:Ee,listeners:ie}),Ee.data=Qt)),Ex(pt,t,q,a,et)}e0(pt,n)})}function Wo(t,n,a){return{instance:t,listener:n,currentTarget:a}}function Ou(t,n){for(var a=n+"Capture",s=[];t!==null;){var l=t,c=l.stateNode;if(l=l.tag,l!==5&&l!==26&&l!==27||c===null||(l=po(t,a),l!=null&&s.unshift(Wo(t,l,c)),l=po(t,n),l!=null&&s.push(Wo(t,l,c))),t.tag===3)return s;t=t.return}return[]}function Rx(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function i0(t,n,a,s,l){for(var c=n._reactName,p=[];a!==null&&a!==s;){var E=a,N=E.alternate,q=E.stateNode;if(E=E.tag,N!==null&&N===s)break;E!==5&&E!==26&&E!==27||q===null||(N=q,l?(q=po(a,c),q!=null&&p.unshift(Wo(a,q,N))):l||(q=po(a,c),q!=null&&p.push(Wo(a,q,N)))),a=a.return}p.length!==0&&t.push({event:n,listeners:p})}var Cx=/\r\n?/g,wx=/\u0000|\uFFFD/g;function a0(t){return(typeof t=="string"?t:""+t).replace(Cx,`
`).replace(wx,"")}function s0(t,n){return n=a0(n),a0(t)===n}function Be(t,n,a,s,l,c){switch(a){case"children":if(typeof s=="string")n==="body"||n==="textarea"&&s===""||$s(t,s);else if(typeof s=="number"||typeof s=="bigint")n!=="body"&&$s(t,""+s);else return;break;case"className":Rl(t,"class",s);break;case"tabIndex":Rl(t,"tabindex",s);break;case"dir":case"role":case"viewBox":case"width":case"height":Rl(t,a,s);break;case"style":tm(t,s,c);return;case"data":if(n!=="object"){Rl(t,"data",s);break}case"src":case"href":if(s===""&&(n!=="a"||a!=="href")){t.removeAttribute(a);break}if(s==null||typeof s=="function"||typeof s=="symbol"||typeof s=="boolean"){t.removeAttribute(a);break}s=Cl(s),t.setAttribute(a,s);break;case"action":case"formAction":if(typeof s=="function"){t.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof c=="function"&&(a==="formAction"?(n!=="input"&&Be(t,n,"name",l.name,l,null),Be(t,n,"formEncType",l.formEncType,l,null),Be(t,n,"formMethod",l.formMethod,l,null),Be(t,n,"formTarget",l.formTarget,l,null)):(Be(t,n,"encType",l.encType,l,null),Be(t,n,"method",l.method,l,null),Be(t,n,"target",l.target,l,null)));if(s==null||typeof s=="symbol"||typeof s=="boolean"){t.removeAttribute(a);break}s=Cl(s),t.setAttribute(a,s);break;case"onClick":s!=null&&(t.onclick=zi);return;case"onScroll":s!=null&&ye("scroll",t);return;case"onScrollEnd":s!=null&&ye("scrollend",t);return;case"dangerouslySetInnerHTML":if(s!=null){if(typeof s!="object"||!("__html"in s))throw Error(r(61));if(a=s.__html,a!=null){if(l.children!=null)throw Error(r(60));c?.__html!==a&&(t.innerHTML=a)}}break;case"multiple":t.multiple=s&&typeof s!="function"&&typeof s!="symbol";break;case"muted":t.muted=s&&typeof s!="function"&&typeof s!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(s==null||typeof s=="function"||typeof s=="boolean"||typeof s=="symbol"){t.removeAttribute("xlink:href");break}a=Cl(s),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":s!=null&&typeof s!="function"&&typeof s!="symbol"?t.setAttribute(a,s):t.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":s&&typeof s!="function"&&typeof s!="symbol"?t.setAttribute(a,""):t.removeAttribute(a);break;case"capture":case"download":s===!0?t.setAttribute(a,""):s!==!1&&s!=null&&typeof s!="function"&&typeof s!="symbol"?t.setAttribute(a,s):t.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":s!=null&&typeof s!="function"&&typeof s!="symbol"&&!isNaN(s)&&1<=s?t.setAttribute(a,s):t.removeAttribute(a);break;case"rowSpan":case"start":s==null||typeof s=="function"||typeof s=="symbol"||isNaN(s)?t.removeAttribute(a):t.setAttribute(a,s);break;case"popover":ye("beforetoggle",t),ye("toggle",t),Al(t,"popover",s);break;case"xlinkActuate":na(t,"http://www.w3.org/1999/xlink","xlink:actuate",s);break;case"xlinkArcrole":na(t,"http://www.w3.org/1999/xlink","xlink:arcrole",s);break;case"xlinkRole":na(t,"http://www.w3.org/1999/xlink","xlink:role",s);break;case"xlinkShow":na(t,"http://www.w3.org/1999/xlink","xlink:show",s);break;case"xlinkTitle":na(t,"http://www.w3.org/1999/xlink","xlink:title",s);break;case"xlinkType":na(t,"http://www.w3.org/1999/xlink","xlink:type",s);break;case"xmlBase":na(t,"http://www.w3.org/XML/1998/namespace","xml:base",s);break;case"xmlLang":na(t,"http://www.w3.org/XML/1998/namespace","xml:lang",s);break;case"xmlSpace":na(t,"http://www.w3.org/XML/1998/namespace","xml:space",s);break;case"is":Al(t,"is",s);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=jS.get(a)||a,Al(t,a,s);else return}Ce=!0}function Lh(t,n,a,s,l,c){switch(a){case"style":tm(t,s,c);return;case"dangerouslySetInnerHTML":if(s!=null){if(typeof s!="object"||!("__html"in s))throw Error(r(61));if(a=s.__html,a!=null){if(l.children!=null)throw Error(r(60));c?.__html!==a&&(t.innerHTML=a)}}break;case"children":if(typeof s=="string")$s(t,s);else if(typeof s=="number"||typeof s=="bigint")$s(t,""+s);else return;break;case"onScroll":s!=null&&ye("scroll",t);return;case"onScrollEnd":s!=null&&ye("scrollend",t);return;case"onClick":s!=null&&(t.onclick=zi);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!zn.hasOwnProperty(a))t:{if(a[0]==="o"&&a[1]==="n"&&(l=a.endsWith("Capture"),c=a.slice(2,l?a.length-7:void 0),n=t[Xt]||null,n=n!=null?n[a]:null,typeof n=="function"&&t.removeEventListener(c,n,l),typeof s=="function")){typeof n!="function"&&n!==null&&(a in t?t[a]=null:t.hasAttribute(a)&&t.removeAttribute(a)),t.addEventListener(c,s,l);break t}Ce=!0,a in t?t[a]=s:s===!0?t.setAttribute(a,""):Al(t,a,s)}return}Ce=!0}function Cn(t,n,a){switch(n){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":ye("error",t),ye("load",t);var s=!1,l=!1,c;for(c in a)if(a.hasOwnProperty(c)){var p=a[c];if(p!=null)switch(c){case"src":s=!0;break;case"srcSet":l=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(r(137,n));default:Be(t,n,c,p,a,null)}}l&&Be(t,n,"srcSet",a.srcSet,a,null),s&&Be(t,n,"src",a.src,a,null);return;case"input":ye("invalid",t);var E=c=p=l=null,N=null,q=null;for(s in a)if(a.hasOwnProperty(s)){var et=a[s];if(et!=null)switch(s){case"name":l=et;break;case"type":p=et;break;case"checked":N=et;break;case"defaultChecked":q=et;break;case"value":c=et;break;case"defaultValue":E=et;break;case"children":case"dangerouslySetInnerHTML":if(et!=null)throw Error(r(137,n));break;default:Be(t,n,s,et,a,null)}}Kp(t,c,E,N,q,p,l,!1);return;case"select":ye("invalid",t),s=p=c=null;for(l in a)if(a.hasOwnProperty(l)&&(E=a[l],E!=null))switch(l){case"value":c=E;break;case"defaultValue":p=E;break;case"multiple":s=E;default:Be(t,n,l,E,a,null)}n=c,a=p,t.multiple=!!s,n!=null?Js(t,!!s,n,!1):a!=null&&Js(t,!!s,a,!0);return;case"textarea":ye("invalid",t),c=l=s=null;for(p in a)if(a.hasOwnProperty(p)&&(E=a[p],E!=null))switch(p){case"value":s=E;break;case"defaultValue":l=E;break;case"children":c=E;break;case"dangerouslySetInnerHTML":if(E!=null)throw Error(r(91));break;default:Be(t,n,p,E,a,null)}Jp(t,s,l,c);return;case"option":for(N in a)a.hasOwnProperty(N)&&(s=a[N],s!=null)&&(N==="selected"?t.selected=s&&typeof s!="function"&&typeof s!="symbol":Be(t,n,N,s,a,null));return;case"dialog":ye("beforetoggle",t),ye("toggle",t),ye("cancel",t),ye("close",t);break;case"iframe":case"object":ye("load",t);break;case"video":case"audio":for(s=0;s<qo.length;s++)ye(qo[s],t);break;case"image":ye("error",t),ye("load",t);break;case"details":ye("toggle",t);break;case"embed":case"source":case"link":ye("error",t),ye("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(q in a)if(a.hasOwnProperty(q)&&(s=a[q],s!=null))switch(q){case"children":case"dangerouslySetInnerHTML":throw Error(r(137,n));default:Be(t,n,q,s,a,null)}return;default:if(Oc(n)){for(et in a)a.hasOwnProperty(et)&&(s=a[et],s!==void 0&&Lh(t,n,et,s,a,void 0));return}}for(E in a)a.hasOwnProperty(E)&&(s=a[E],s!=null&&Be(t,n,E,s,a,null))}var Dx={};function Ux(t,n,a,s){switch(n){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var l=null,c=null,p=null,E=null,N=null,q=null,et=null;for($ in a){var pt=a[$];if(a.hasOwnProperty($)&&pt!=null)switch($){case"checked":break;case"value":break;case"defaultValue":N=pt;default:s.hasOwnProperty($)||Be(t,n,$,null,s,pt)}}for(var X in s){var $=s[X];if(pt=a[X],s.hasOwnProperty(X)&&($!=null||pt!=null))switch(X){case"type":$!==pt&&(Ce=!0),c=$;break;case"name":$!==pt&&(Ce=!0),l=$;break;case"checked":$!==pt&&(Ce=!0),q=$;break;case"defaultChecked":$!==pt&&(Ce=!0),et=$;break;case"value":$!==pt&&(Ce=!0),p=$;break;case"defaultValue":$!==pt&&(Ce=!0),E=$;break;case"children":case"dangerouslySetInnerHTML":if($!=null)throw Error(r(137,n));break;default:$!==pt&&Be(t,n,X,$,s,pt)}}Nc(t,p,E,N,q,et,c,l);return;case"select":$=p=E=X=null;for(c in a)if(N=a[c],a.hasOwnProperty(c)&&N!=null)switch(c){case"value":break;case"multiple":$=N;default:s.hasOwnProperty(c)||Be(t,n,c,null,s,N)}for(l in s)if(c=s[l],N=a[l],s.hasOwnProperty(l)&&(c!=null||N!=null))switch(l){case"value":c!==N&&(Ce=!0),X=c;break;case"defaultValue":c!==N&&(Ce=!0),E=c;break;case"multiple":c!==N&&(Ce=!0),p=c;default:c!==N&&Be(t,n,l,c,s,N)}n=E,a=p,s=$,X!=null?Js(t,!!a,X,!1):!!s!=!!a&&(n!=null?Js(t,!!a,n,!0):Js(t,!!a,a?[]:"",!1));return;case"textarea":$=X=null;for(E in a)if(l=a[E],a.hasOwnProperty(E)&&l!=null&&!s.hasOwnProperty(E))switch(E){case"value":break;case"children":break;default:Be(t,n,E,null,s,l)}for(p in s)if(l=s[p],c=a[p],s.hasOwnProperty(p)&&(l!=null||c!=null))switch(p){case"value":l!==c&&(Ce=!0),X=l;break;case"defaultValue":l!==c&&(Ce=!0),$=l;break;case"children":break;case"dangerouslySetInnerHTML":if(l!=null)throw Error(r(91));break;default:l!==c&&Be(t,n,p,l,s,c)}Qp(t,X,$);return;case"option":for(var Dt in a)X=a[Dt],a.hasOwnProperty(Dt)&&X!=null&&!s.hasOwnProperty(Dt)&&(Dt==="selected"?t.selected=!1:Be(t,n,Dt,null,s,X));for(N in s)X=s[N],$=a[N],s.hasOwnProperty(N)&&X!==$&&(X!=null||$!=null)&&(N==="selected"?(X!==$&&(Ce=!0),t.selected=X&&typeof X!="function"&&typeof X!="symbol"):Be(t,n,N,X,s,$));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var kt in a)X=a[kt],a.hasOwnProperty(kt)&&X!=null&&!s.hasOwnProperty(kt)&&Be(t,n,kt,null,s,X);for(q in s)if(X=s[q],$=a[q],s.hasOwnProperty(q)&&X!==$&&(X!=null||$!=null))switch(q){case"children":case"dangerouslySetInnerHTML":if(X!=null)throw Error(r(137,n));break;default:Be(t,n,q,X,s,$)}return;default:if(Oc(n)){for(var he in a)X=a[he],a.hasOwnProperty(he)&&X!==void 0&&!s.hasOwnProperty(he)&&Lh(t,n,he,void 0,s,X);for(et in s)X=s[et],$=a[et],!s.hasOwnProperty(et)||X===$||X===void 0&&$===void 0||Lh(t,n,et,X,s,$);return}}for(var Y in a)X=a[Y],a.hasOwnProperty(Y)&&X!=null&&!s.hasOwnProperty(Y)&&Be(t,n,Y,null,s,X);for(pt in s)X=s[pt],$=a[pt],!s.hasOwnProperty(pt)||X===$||X==null&&$==null||Be(t,n,pt,X,s,$)}function r0(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function Nx(){if(typeof performance.getEntriesByType=="function"){for(var t=0,n=0,a=performance.getEntriesByType("resource"),s=0;s<a.length;s++){var l=a[s],c=l.transferSize,p=l.initiatorType,E=l.duration;if(c&&E&&r0(p)){for(p=0,E=l.responseEnd,s+=1;s<a.length;s++){var N=a[s],q=N.startTime;if(q>E)break;var et=N.transferSize,pt=N.initiatorType;et&&r0(pt)&&(N=N.responseEnd,p+=et*(N<E?1:(E-q)/(N-q)))}if(--s,n+=8*(c+p)/(l.duration/1e3),t++,10<t)break}}if(0<t)return n/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var Oh=null,Ph=null;function jo(t){return t.nodeType===9?t:t.ownerDocument}function o0(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function l0(t,n){if(t===0)switch(n){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&n==="foreignObject"?0:t}function u0(t,n,a,s){return a=jo(a).createElement(t),a[Ct]=s,a[Xt]=n,Cn(a,t,n),Re(a),a}function zh(t,n){return t==="textarea"||t==="noscript"||typeof n.children=="string"||typeof n.children=="number"||typeof n.children=="bigint"||typeof n.dangerouslySetInnerHTML=="object"&&n.dangerouslySetInnerHTML!==null&&n.dangerouslySetInnerHTML.__html!=null}var Ih=null;function Lx(){var t=window.event;return t&&t.type==="popstate"?t===Ih?!1:(Ih=t,!0):(Ih=null,!1)}var Bh=typeof setTimeout=="function"?setTimeout:void 0,Ox=typeof clearTimeout=="function"?clearTimeout:void 0,c0=typeof Promise=="function"?Promise:void 0,f0=typeof requestAnimationFrame=="function"?requestAnimationFrame:Bh,Px=typeof queueMicrotask=="function"?queueMicrotask:typeof c0<"u"?function(t){return c0.resolve(null).then(t).catch(zx)}:Bh;function zx(t){setTimeout(function(){throw t})}function qa(t){return t==="head"}function h0(t,n){var a=n,s=0;do{var l=a.nextSibling;if(t.removeChild(a),l&&l.nodeType===8)if(a=l.data,a==="/$"||a==="/&"){if(s===0){t.removeChild(l),zr(n);return}s--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")s++;else if(a==="html")qh(t.ownerDocument.documentElement);else if(a==="head"){a=t.ownerDocument.head,qh(a);for(var c=a.firstChild;c;){var p=c.nextSibling,E=c.nodeName;c[Ue]||E==="SCRIPT"||E==="STYLE"||E==="LINK"&&c.rel.toLowerCase()==="stylesheet"||a.removeChild(c),c=p}}else a==="body"&&qh(t.ownerDocument.body);a=l}while(a);zr(n)}function d0(t,n){var a=t;t=0;do{var s=a.nextSibling;if(a.nodeType===1?n?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(n?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),s&&s.nodeType===8)if(a=s.data,a==="/$"){if(t===0)break;t--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||t++;a=s}while(a)}function p0(t,n,a){if(n=CSS.escape(n)!==n?"r-"+btoa(n).replace(/=/g,""):n,t.style.viewTransitionName=n,a!=null&&(t.style.viewTransitionClass=a),a=getComputedStyle(t),a.display==="inline"){if(n=t.getClientRects(),n.length===1)var s=1;else for(var l=s=0;l<n.length;l++){var c=n[l];0<c.width&&0<c.height&&s++}s===1&&(t=t.style,t.display=n.length===1?"inline-block":"block",t.marginTop="-"+a.paddingTop,t.marginBottom="-"+a.paddingBottom)}}function m0(t,n){t=t.style,n=n.style;var a=n!=null?n.hasOwnProperty("viewTransitionName")?n.viewTransitionName:n.hasOwnProperty("view-transition-name")?n["view-transition-name"]:null:null;t.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=n!=null?n.hasOwnProperty("viewTransitionClass")?n.viewTransitionClass:n.hasOwnProperty("view-transition-class")?n["view-transition-class"]:null:null,t.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),t.display==="inline-block"&&(n==null?t.display=t.margin="":(a=n.display,t.display=a==null||typeof a=="boolean"?"":a,a=n.margin,a!=null?t.margin=a:(a=n.hasOwnProperty("marginTop")?n.marginTop:n["margin-top"],t.marginTop=a==null||typeof a=="boolean"?"":a,n=n.hasOwnProperty("marginBottom")?n.marginBottom:n["margin-bottom"],t.marginBottom=n==null||typeof n=="boolean"?"":n)))}function Ix(t,n,a){return a=a.ownerDocument.defaultView,{rect:t,abs:n.position==="absolute"||n.position==="fixed",clip:n.clipPath!=="none"||n.overflow!=="visible"||n.filter!=="none"||n.mask!=="none"||n.mask!=="none"||n.borderRadius!=="0px",view:0<=t.bottom&&0<=t.right&&t.top<=a.innerHeight&&t.left<=a.innerWidth}}function Fh(t){var n=t.getBoundingClientRect(),a=getComputedStyle(t);return Ix(n,a,t)}function Bx(t){return t.documentElement.clientHeight}function Fx(t){this.addEventListener("load",t),this.addEventListener("error",t)}function Hx(t,n,a,s,l,c,p,E,N){var q=n.nodeType===9?n:n.ownerDocument;try{var et=q.startViewTransition({update:function(){var X=q.defaultView,$=X.navigation&&X.navigation.transition,Dt=q.fonts.status;s();var kt=[];if(Dt==="loaded"&&(Bx(q),q.fonts.status==="loading"&&kt.push(q.fonts.ready)),Dt=kt.length,t!==null)for(var he=t.suspenseyImages,Y=0,F=0;F<he.length;F++){var Q=he[F];if(!Q.complete){var ht=Q.getBoundingClientRect();if(0<ht.bottom&&0<ht.right&&ht.top<X.innerHeight&&ht.left<X.innerWidth){if(Y+=z0(Q),Y>Iu){kt.length=Dt;break}Q=new Promise(Fx.bind(Q)),kt.push(Q)}}}if(0<kt.length)return X=Promise.race([Promise.all(kt),new Promise(function(Ft){return setTimeout(Ft,500)})]).then(l,l),($?Promise.allSettled([$.finished,X]):X).then(c,c);if(l(),$)return $.finished.then(c,c);c()},types:a});q.__reactViewTransition=et;var pt=[];return et.ready.then(function(){for(var X=q.documentElement.getAnimations({subtree:!0}),$=0;$<X.length;$++){var Dt=X[$],kt=Dt.effect,he=kt.pseudoElement;if(he!=null&&he.startsWith("::view-transition")){pt.push(Dt),Dt=kt.getKeyframes();for(var Y=he=void 0,F=!0,Q=0;Q<Dt.length;Q++){var ht=Dt[Q],Ft=ht.width;if(he===void 0)he=Ft;else if(he!==Ft){F=!1;break}if(Ft=ht.height,Y===void 0)Y=Ft;else if(Y!==Ft){F=!1;break}delete ht.width,delete ht.height,ht.transform==="none"&&delete ht.transform}F&&he!==void 0&&Y!==void 0&&(kt.setKeyframes(Dt),F=getComputedStyle(kt.target,kt.pseudoElement),F.width!==he||F.height!==Y)&&(F=Dt[0],F.width=he,F.height=Y,F=Dt[Dt.length-1],F.width=he,F.height=Y,kt.setKeyframes(Dt))}}p()},function(X){q.__reactViewTransition===et&&(q.__reactViewTransition=null);try{typeof X=="object"&&X!==null&&X.name==="InvalidStateError"&&(X.message==="View transition was skipped because document visibility state is hidden."||X.message==="Skipping view transition because document visibility state has become hidden."||X.message==="Skipping view transition because viewport size changed."||X.message==="Transition was aborted because of invalid state")&&(X=null),X!==null&&N(X)}finally{s(),l(),p()}}),et.finished.finally(function(){for(var X=0;X<pt.length;X++)pt[X].cancel();q.__reactViewTransition===et&&(q.__reactViewTransition=null),E()}),et}catch{return s(),l(),p(),null}}function Os(t,n){this._scope=document.documentElement,this._selector="::view-transition-"+t+"("+n+")"}Os.prototype.animate=function(t,n){return n=typeof n=="number"?{duration:n}:O({},n),n.pseudoElement=this._selector,this._scope.animate(t,n)},Os.prototype.getAnimations=function(){for(var t=this._scope,n=this._selector,a=t.getAnimations({subtree:!0}),s=[],l=0;l<a.length;l++){var c=a[l].effect;c!==null&&c.target===t&&c.pseudoElement===n&&s.push(a[l])}return s},Os.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function _0(t){return{name:t,group:new Os("group",t),imagePair:new Os("image-pair",t),old:new Os("old",t),new:new Os("new",t)}}function si(t){this._fragmentFiber=t,this._observers=this._eventListeners=null}si.prototype.addEventListener=function(t,n,a){var s=null,l=null;if(!(a!=null&&typeof a!="boolean"&&(s=a.signal||null,s!==null&&s.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var c=this._eventListeners;if(v0(c,t,n,a)===-1){var p=this,E=n;a!=null&&typeof a!="boolean"&&a.once===!0&&(E=function(N){p.removeEventListener(t,n,a),typeof n=="function"?n.call(this,N):n.handleEvent(N)}),s!==null&&(l=p.removeEventListener.bind(p,t,n,a),s.addEventListener("abort",l,{once:!0}),l=s.removeEventListener.bind(s,"abort",l)),s=Dr(a),c.push({type:t,listener:n,optionsOrUseCapture:a,attachedListener:E,cleanup:l}),m(this._fragmentFiber.child,!1,Gx,t,E,s)}this._eventListeners=c}};function Gx(t,n,a,s){return x(t).addEventListener(n,a,s),!1}si.prototype.removeEventListener=function(t,n,a){var s=this._eventListeners;if(s!==null&&(n=v0(s,t,n,a),n!==-1)){var l=s[n];a=l.attachedListener;var c=l.cleanup;l=Dr(l.optionsOrUseCapture),m(this._fragmentFiber.child,!1,Vx,t,a,l),s.splice(n,1),c!==null&&c()}};function Vx(t,n,a,s){return x(t).removeEventListener(n,a,s),!1}function Dr(t){return t!=null&&typeof t!="boolean"&&(t.once===!0||t.signal instanceof AbortSignal)?{capture:t.capture,passive:t.passive}:t}function g0(t){return t==null?"c=0":typeof t=="boolean"?"c="+(t?"1":"0"):"c="+(t.capture?"1":"0")}function v0(t,n,a,s){if(t.length===0)return-1;s=g0(s);for(var l=0;l<t.length;l++){var c=t[l];if(c.type===n&&c.listener===a&&g0(c.optionsOrUseCapture)===s)return l}return-1}si.prototype.dispatchEvent=function(t){var n=y(this._fragmentFiber);if(n===null)return!0;n=x(n);var a=this._eventListeners;if(a!==null&&0<a.length||!t.bubbles){var s=n.nodeType===9?n.createComment(""):document.createTextNode("");if(a)for(var l=0;l<a.length;l++){var c=a[l];s.addEventListener(c.type,c.attachedListener,Dr(c.optionsOrUseCapture))}if(n.appendChild(s),t=s.dispatchEvent(t),a)for(l=0;l<a.length;l++)c=a[l],s.removeEventListener(c.type,c.attachedListener,Dr(c.optionsOrUseCapture));return n.removeChild(s),t}return n.dispatchEvent(t)},si.prototype.focus=function(t){m(this._fragmentFiber.child,!0,S0,t,void 0,void 0)};function S0(t,n){return t.tag===6?!1:(t=x(t),tM(t,n))}si.prototype.focusLast=function(t){var n=[];m(this._fragmentFiber.child,!0,Hh,n,void 0,void 0);for(var a=n.length-1;0<=a&&!S0(n[a],t);a--);};function Hh(t,n){return n.push(t),!1}si.prototype.blur=function(){var t=y(this._fragmentFiber);t!==null&&(t=x(t),t=jo(t).activeElement,t!==null&&m(this._fragmentFiber.child,!1,Xx,t,void 0,void 0))};function Xx(t,n){return t.tag===6?!1:(t=x(t),t===n||t.contains(n)?(n.blur(),!0):!1)}si.prototype.observeUsing=function(t){this._observers===null&&(this._observers=new Set),this._observers.add(t),m(this._fragmentFiber.child,!1,kx,t,void 0,void 0)};function kx(t,n){return t.tag===6||(t=x(t),n.observe(t)),!1}si.prototype.unobserveUsing=function(t){var n=this._observers;if(n!==null&&n.has(t)){n.delete(t),m(this._fragmentFiber.child,!1,Yx,t,void 0,void 0);for(var a=n=0;a<Ci.length;a++){var s=Ci[a];s.fragmentInstance===this&&s.observer===t?t.unobserve(s.instance):Ci[n++]=s}Ci.length=n}};function Yx(t,n){return t.tag===6||(t=x(t),n.unobserve(t)),!1}var Ci=[],Gh=!1;function qx(t,n,a){Ci.push({fragmentInstance:t,observer:n,instance:a}),Gh||(Gh=!0,eM(function(){Gh=!1;var s=Ci;Ci=[];for(var l=0;l<s.length;l++){var c=s[l];c.observer.unobserve(c.instance)}}))}si.prototype.getClientRects=function(){var t=[];return m(this._fragmentFiber.child,!1,Wx,t,void 0,void 0),t};function Wx(t,n){if(t.tag===6){t=t.stateNode;var a=t.ownerDocument.createRange();a.selectNodeContents(t),n.push.apply(n,a.getClientRects())}else t=x(t),n.push.apply(n,t.getClientRects());return!1}si.prototype.getRootNode=function(t){var n=y(this._fragmentFiber);return n===null?this:x(n).getRootNode(t)},si.prototype.compareDocumentPosition=function(t){var n=y(this._fragmentFiber);if(n===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];m(this._fragmentFiber.child,!1,Hh,a,void 0,void 0);var s=x(n);if(a.length===0){if(a=s,M(this._fragmentFiber)){t:{for(n=this._fragmentFiber.return;n!==null;){if(n.tag===4){n=n.stateNode.containerInfo;break t}if(n.tag===3||n.tag===5||n.tag===27)break;n=n.return}n=null}n!=null&&(a=n)}n=this._fragmentFiber;var l=s=a.compareDocumentPosition(t);return a===t?l=Node.DOCUMENT_POSITION_CONTAINS:s&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=A(n)[1],a===null?l=Node.DOCUMENT_POSITION_PRECEDING:(t=x(a).compareDocumentPosition(t),l=t===0||t&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),l|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}n=x(a[0]),l=x(a[a.length-1]);var c=M(this._fragmentFiber)?n.parentElement:s;if(c==null)return Node.DOCUMENT_POSITION_DISCONNECTED;s=c.compareDocumentPosition(n)&Node.DOCUMENT_POSITION_CONTAINED_BY,c=c.compareDocumentPosition(l)&Node.DOCUMENT_POSITION_CONTAINED_BY;var p=n.compareDocumentPosition(t),E=l.compareDocumentPosition(t),N=p&Node.DOCUMENT_POSITION_CONTAINED_BY||E&Node.DOCUMENT_POSITION_CONTAINED_BY;return E=s&&c&&p&Node.DOCUMENT_POSITION_FOLLOWING&&E&Node.DOCUMENT_POSITION_PRECEDING,n=s&&n===t||c&&l===t||N||E?Node.DOCUMENT_POSITION_CONTAINED_BY:!s&&n===t||!c&&l===t?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:p,n&Node.DOCUMENT_POSITION_DISCONNECTED||n&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||jx(n,this._fragmentFiber,a[0],a[a.length-1],t)?n:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function jx(t,n,a,s,l){var c=Ne(l);if(t&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!c)t:{for(;c!==null;){if(c.tag===7&&(c===n||c.alternate===n)){a=!0;break t}c=c.return}a=!1}return a}if(t&Node.DOCUMENT_POSITION_CONTAINS){if(c===null)return c=l.ownerDocument,l===c||l===c.documentElement||l===c.body;t:{for(c=n,n=y(n);c!==null;){if(!(c.tag!==5&&c.tag!==3&&c.tag!==27||c!==n&&c.alternate!==n)){c=!0;break t}c=c.return}c=!1}return c}return t&Node.DOCUMENT_POSITION_PRECEDING?((n=!!c)&&!(n=c===a)&&(n=B(a,c,H),n===null?n=!1:(m(n,!0,P,c,a),c=v,v=null,n=c!==null)),n):t&Node.DOCUMENT_POSITION_FOLLOWING?((n=!!c)&&!(n=c===s)&&(n=B(s,c,H),n===null?n=!1:(m(n,!0,D,c,s),c=v,z=v=null,n=c!==null)),n):!1}function y0(t,n){var a=t.ownerDocument.createRange();a.selectNodeContents(t),t=a.getBoundingClientRect(),window.scrollTo(window.scrollX+t.left,n?window.scrollY+t.top:window.scrollY+t.bottom-window.innerHeight)}si.prototype.scrollIntoView=function(t){if(typeof t=="object")throw Error(r(566));var n=[];m(this._fragmentFiber.child,!1,Hh,n,void 0,void 0);var a=t!==!1;if(n.length===0){var s=A(this._fragmentFiber);if(s=a?s[1]||s[0]||y(this._fragmentFiber):s[0]||s[1],s===null)return;if(s.tag===6){t=x(s),y0(t,a);return}if(s=x(s),s.nodeType!==9){if(s.nodeType===11){a="host"in s?s.host:null,a!==null&&a.scrollIntoView(t);return}s.scrollIntoView(t)}}for(s=a?n.length-1:0;s!==(a?-1:n.length);){var l=n[s];l.tag===6?(l=x(l),y0(l,a)):x(l).scrollIntoView(t),s+=a?-1:1}};function Zx(t,n){return t=x(t),x0(t,n),!1}function x0(t,n){t.reactFragments==null&&(t.reactFragments=new Set),t.reactFragments.add(n)}function M0(t,n){var a=n._eventListeners;if(a!==null)for(var s=0;s<a.length;s++){var l=a[s];t.addEventListener(l.type,l.attachedListener,Dr(l.optionsOrUseCapture))}t.nodeType!==3&&(a=n._observers,a!==null&&a.forEach(function(c){for(var p=0,E=0;E<Ci.length;E++){var N=Ci[E];(N.fragmentInstance!==n||N.observer!==c||N.instance!==t)&&(Ci[p++]=N)}Ci.length=p,c.observe(t)}),x0(t,n))}function Kx(t,n){var a=n._eventListeners;if(a!==null)for(var s=0;s<a.length;s++){var l=a[s];t.removeEventListener(l.type,l.attachedListener,Dr(l.optionsOrUseCapture))}t.nodeType!==3&&(a=n._observers,a!==null&&a.forEach(function(c){typeof c.rootMargin=="string"?qx(n,c,t):c.unobserve(t)}),t.reactFragments!=null&&t.reactFragments.delete(n))}function Vh(t){var n=t.firstChild;for(n&&n.nodeType===10&&(n=n.nextSibling);n;){var a=n;switch(n=n.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Vh(a),$t(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}t.removeChild(a)}}function Qx(t,n,a,s){for(;t.nodeType===1;){var l=a;if(t.nodeName.toLowerCase()!==n.toLowerCase()){if(!s&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(s){if(!t[Ue])switch(n){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(c=t.getAttribute("rel"),c==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(c!==l.rel||t.getAttribute("href")!==(l.href==null||l.href===""?null:l.href)||t.getAttribute("crossorigin")!==(l.crossOrigin==null?null:l.crossOrigin)||t.getAttribute("title")!==(l.title==null?null:l.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(c=t.getAttribute("src"),(c!==(l.src==null?null:l.src)||t.getAttribute("type")!==(l.type==null?null:l.type)||t.getAttribute("crossorigin")!==(l.crossOrigin==null?null:l.crossOrigin))&&c&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(n==="input"&&t.type==="hidden"){var c=l.name==null?null:""+l.name;if(l.type==="hidden"&&t.getAttribute("name")===c)return t}else return t;if(t=vi(t.nextSibling),t===null)break}return null}function Jx(t,n,a){if(n==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!a||(t=vi(t.nextSibling),t===null))return null;return t}function E0(t,n){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=vi(t.nextSibling),t===null))return null;return t}function Xh(t){return t.data==="$?"||t.data==="$~"}function kh(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function $x(t,n){var a=t.ownerDocument;if(t.data==="$~")t._reactRetry=n;else if(t.data!=="$?"||a.readyState!=="loading")n();else{var s=function(){n(),a.removeEventListener("DOMContentLoaded",s)};a.addEventListener("DOMContentLoaded",s),t._reactRetry=s}}function vi(t){for(;t!=null;t=t.nextSibling){var n=t.nodeType;if(n===1||n===3)break;if(n===8){if(n=t.data,n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"||n==="F!"||n==="F")break;if(n==="/$"||n==="/&")return null}}return t}var Yh=null;function T0(t){t=t.nextSibling;for(var n=0;t;){if(t.nodeType===8){var a=t.data;if(a==="/$"||a==="/&"){if(n===0)return vi(t.nextSibling);n--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||n++}t=t.nextSibling}return null}function b0(t){t=t.previousSibling;for(var n=0;t;){if(t.nodeType===8){var a=t.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(n===0)return t;n--}else a!=="/$"&&a!=="/&"||n++}t=t.previousSibling}return null}function tM(t,n){function a(){s=!0}if(t.ownerDocument.activeElement===t)return!0;var s=!1;try{t.ownerDocument.addEventListener("focus",a,!0),(t.focus||HTMLElement.prototype.focus).call(t,n)}finally{t.ownerDocument.removeEventListener("focus",a,!0)}return s}function eM(t){f0(function(){f0(function(n){return t(n)})})}function A0(t,n,a){switch(n=jo(a),t){case"html":if(t=n.documentElement,!t)throw Error(r(452));return t;case"head":if(t=n.head,!t)throw Error(r(453));return t;case"body":if(t=n.body,!t)throw Error(r(454));return t;default:throw Error(r(451))}}function R0(t,n,a){for(var s in a){var l=a[s];a.hasOwnProperty(s)&&l!=null&&Be(t,n,s,null,Dx,l)}a.dangerouslySetInnerHTML!=null&&(t.textContent=""),t.onclick===zi&&(t.onclick=null),$t(t)}function qh(t){for(var n=t.attributes;n.length;)t.removeAttributeNode(n[0]);$t(t)}var Si=new Map,C0=new Set;function Zo(t){if(typeof t.getRootNode=="function"){var n=t.getRootNode();if(n.nodeType===9||n.nodeType===11)return n}return t.nodeType===9?t:t.ownerDocument}var ma=Yt.d;Yt.d={f:nM,r:iM,D:aM,C:sM,L:rM,m:oM,X:uM,S:lM,M:cM};function nM(){var t=ma.f(),n=Cu();return t||n}function iM(t){var n=me(t);n!==null&&n.tag===5&&n.type==="form"?D_(n):ma.r(t)}var Ur=typeof document>"u"?null:document;function w0(t,n,a){var s=Ur;if(s&&typeof n=="string"&&n){var l=fi(n);l='link[rel="'+t+'"][href="'+l+'"]',typeof a=="string"&&(l+='[crossorigin="'+a+'"]'),C0.has(l)||(C0.add(l),t={rel:t,crossOrigin:a,href:n},s.querySelector(l)===null&&(n=s.createElement("link"),Cn(n,"link",t),Re(n),s.head.appendChild(n)))}}function aM(t){ma.D(t),w0("dns-prefetch",t,null)}function sM(t,n){ma.C(t,n),w0("preconnect",t,n)}function rM(t,n,a){ma.L(t,n,a);var s=Ur;if(s&&t&&n){var l='link[rel="preload"][as="'+fi(n)+'"]';n==="image"&&a&&a.imageSrcSet?(l+='[imagesrcset="'+fi(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(l+='[imagesizes="'+fi(a.imageSizes)+'"]')):l+='[href="'+fi(t)+'"]';var c=l;switch(n){case"style":c=Nr(t);break;case"script":c=Lr(t)}if(!(Si.has(c)||(t=O({rel:"preload",href:n==="image"&&a&&a.imageSrcSet?void 0:t,as:n},a),Si.set(c,t),s.querySelector(l)!==null||n==="style"&&s.querySelector(Ko(c))||n==="script"&&s.querySelector(Qo(c))))){var p=s.createElement("link");Cn(p,"link",t),n==="style"&&(p[Ae]=!0,p.onload=p.onerror=function(){ba(p)}),Re(p),s.head.appendChild(p)}}}function oM(t,n){ma.m(t,n);var a=Ur;if(a&&t){var s=n&&typeof n.as=="string"?n.as:"script",l='link[rel="modulepreload"][as="'+fi(s)+'"][href="'+fi(t)+'"]',c=l;switch(s){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":c=Lr(t)}if(!Si.has(c)&&(t=O({rel:"modulepreload",href:t},n),Si.set(c,t),a.querySelector(l)===null)){switch(s){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Qo(c)))return}s=a.createElement("link"),Cn(s,"link",t),Re(s),a.head.appendChild(s)}}}function lM(t,n,a){ma.S(t,n,a);var s=Ur;if(s&&t){var l=Qn(s).hoistableStyles,c=Nr(t);n=n||"default";var p=l.get(c);if(!p){var E={loading:0,preload:null};if(p=s.querySelector(Ko(c)))E.loading=5;else{t=O({rel:"stylesheet",href:t,"data-precedence":n},a),(a=Si.get(c))&&Wh(t,a);var N=p=s.createElement("link");Re(N),Cn(N,"link",t),N._p=new Promise(function(q,et){N.onload=q,N.onerror=et}),N.addEventListener("load",function(){E.loading|=1}),N.addEventListener("error",function(){E.loading|=2}),E.loading|=4,Pu(p,n,s)}p={type:"stylesheet",instance:p,count:1,state:E},l.set(c,p)}}}function uM(t,n){ma.X(t,n);var a=Ur;if(a&&t){var s=Qn(a).hoistableScripts,l=Lr(t),c=s.get(l);c||(c=a.querySelector(Qo(l)),c||(t=O({src:t,async:!0},n),(n=Si.get(l))&&jh(t,n),c=a.createElement("script"),Re(c),Cn(c,"link",t),a.head.appendChild(c)),c={type:"script",instance:c,count:1,state:null},s.set(l,c))}}function cM(t,n){ma.M(t,n);var a=Ur;if(a&&t){var s=Qn(a).hoistableScripts,l=Lr(t),c=s.get(l);c||(c=a.querySelector(Qo(l)),c||(t=O({src:t,async:!0,type:"module"},n),(n=Si.get(l))&&jh(t,n),c=a.createElement("script"),Re(c),Cn(c,"link",t),a.head.appendChild(c)),c={type:"script",instance:c,count:1,state:null},s.set(l,c))}}function D0(t,n,a,s){var l=(l=ke.current)?Zo(l):null;if(!l)throw Error(r(446));switch(t){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=Nr(a.href),n=Qn(l).hoistableStyles,s=n.get(a),s||(s={type:"style",instance:null,count:0,state:null},n.set(a,s)),s):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){t=Nr(a.href);var c=Qn(l).hoistableStyles,p=c.get(t);if(p||(l=l.ownerDocument||l,p={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},c.set(t,p),(c=l.querySelector(Ko(t)))?c._p||(p.instance=c,p.state.loading=5):(c=Si.get(t),c||(c={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},Si.set(t,c)),fM(l,t,c,p.state))),n&&s===null)throw Error(r(528,""));return p}if(n&&s!==null)throw Error(r(529,""));return null;case"script":return n=a.async,a=a.src,typeof a=="string"&&n&&typeof n!="function"&&typeof n!="symbol"?(a=Lr(a),n=Qn(l).hoistableScripts,s=n.get(a),s||(s={type:"script",instance:null,count:0,state:null},n.set(a,s)),s):{type:"void",instance:null,count:0,state:null};default:throw Error(r(444,t))}}function Nr(t){return'href="'+fi(t)+'"'}function Ko(t){return'link[rel="stylesheet"]['+t+"]"}function U0(t){return O({},t,{"data-precedence":t.precedence,precedence:null})}function fM(t,n,a,s){if(n=t.querySelector('link[rel="preload"][as="style"]['+n+"]")){if(n[Ae]!==!0){s.loading=1;return}}else n=t.createElement("link"),n[Ae]=!0,n.onload=n.onerror=ba.bind(null,n),Cn(n,"link",a),Re(n),t.head.appendChild(n);s.preload=n,n.addEventListener("load",function(){return s.loading|=1}),n.addEventListener("error",function(){return s.loading|=2})}function Lr(t){return'[src="'+fi(t)+'"]'}function Qo(t){return"script[async]"+t}function N0(t,n,a){if(n.count++,n.instance===null)switch(n.type){case"style":var s=t.querySelector('style[data-href~="'+fi(a.href)+'"]');if(s)return n.instance=s,Re(s),s;var l=O({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return s=(t.ownerDocument||t).createElement("style"),Re(s),Cn(s,"style",l),Pu(s,a.precedence,t),n.instance=s;case"stylesheet":l=Nr(a.href);var c=t.querySelector(Ko(l));if(c)return n.state.loading|=4,n.instance=c,Re(c),c;s=U0(a),(l=Si.get(l))&&Wh(s,l),c=(t.ownerDocument||t).createElement("link"),Re(c);var p=c;return p._p=new Promise(function(E,N){p.onload=E,p.onerror=N}),Cn(c,"link",s),n.state.loading|=4,Pu(c,a.precedence,t),n.instance=c;case"script":return c=Lr(a.src),(l=t.querySelector(Qo(c)))?(n.instance=l,Re(l),l):(s=a,(l=Si.get(c))&&(s=O({},a),jh(s,l)),t=t.ownerDocument||t,l=t.createElement("script"),Re(l),Cn(l,"link",s),t.head.appendChild(l),n.instance=l);case"void":return null;default:throw Error(r(443,n.type))}else n.type==="stylesheet"&&(n.state.loading&4)===0&&(s=n.instance,n.state.loading|=4,Pu(s,a.precedence,t));return n.instance}function Pu(t,n,a){for(var s=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),l=s.length?s[s.length-1]:null,c=l,p=0;p<s.length;p++){var E=s[p];if(E.dataset.precedence===n)c=E;else if(c!==l)break}c?c.parentNode.insertBefore(t,c.nextSibling):(n=a.nodeType===9?a.head:a,n.insertBefore(t,n.firstChild))}function Wh(t,n){t.crossOrigin==null&&(t.crossOrigin=n.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=n.referrerPolicy),t.title==null&&(t.title=n.title)}function jh(t,n){t.crossOrigin==null&&(t.crossOrigin=n.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=n.referrerPolicy),t.integrity==null&&(t.integrity=n.integrity)}var zu=null;function L0(t,n,a){if(zu===null){var s=new Map,l=zu=new Map;l.set(a,s)}else l=zu,s=l.get(a),s||(s=new Map,l.set(a,s));if(s.has(t))return s;for(s.set(t,null),a=a.getElementsByTagName(t),l=0;l<a.length;l++){var c=a[l];if(!(c[Ue]||c[Ct]||t==="link"&&c.getAttribute("rel")==="stylesheet")&&c.namespaceURI!=="http://www.w3.org/2000/svg"){var p=c.getAttribute(n)||"";p=t+p;var E=s.get(p);E?E.push(c):s.set(p,[c])}}return s}function Zh(t,n,a){t=t.ownerDocument||t,t.head.insertBefore(a,n==="title"?t.querySelector("head > title"):null)}function hM(t,n,a){if(a===1||n.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof n.precedence!="string"||typeof n.href!="string"||n.href==="")break;return!0;case"link":if(typeof n.rel!="string"||typeof n.href!="string"||n.href===""||n.onLoad||n.onError)break;return n.rel==="stylesheet"?(t=n.disabled,typeof n.precedence=="string"&&t==null):!0;case"script":if(n.async&&typeof n.async!="function"&&typeof n.async!="symbol"&&!n.onLoad&&!n.onError&&n.src&&typeof n.src=="string")return!0}return!1}function O0(t,n){return t==="img"&&n.src!=null&&n.src!==""&&n.onLoad==null&&n.loading!=="lazy"}function P0(t){return!(t.type==="stylesheet"&&(t.state.loading&3)===0)}function z0(t){return(t.width||100)*(t.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function I0(t,n){typeof n.decode=="function"&&(t.imgCount++,n.complete||(t.imgBytes+=z0(n),t.suspenseyImages.push(n)),t=mM.bind(t),n.decode().then(t,t))}function dM(t,n,a,s){if(a.type==="stylesheet"&&(typeof s.media!="string"||matchMedia(s.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var l=Nr(s.href),c=n.querySelector(Ko(l));if(c){n=c._p,n!==null&&typeof n=="object"&&typeof n.then=="function"&&(t.count++,t=Jo.bind(t),n.then(t,t)),a.state.loading|=4,a.instance=c,Re(c);return}c=n.ownerDocument||n,s=U0(s),(l=Si.get(l))&&Wh(s,l),c=c.createElement("link"),Re(c);var p=c;p._p=new Promise(function(E,N){p.onload=E,p.onerror=N}),Cn(c,"link",s),a.instance=c}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(a,n),(n=a.state.preload)&&(a.state.loading&3)===0&&(t.count++,a=Jo.bind(t),n.addEventListener("load",a),n.addEventListener("error",a))}}var Iu=0;function pM(t,n){return t.stylesheets&&t.count===0&&Fu(t,t.stylesheets),0<t.count||0<t.imgCount?function(a){var s=setTimeout(function(){if(t.stylesheets&&Fu(t,t.stylesheets),t.unsuspend){var c=t.unsuspend;t.unsuspend=null,c()}},6e4+n);0<t.imgBytes&&Iu===0&&(Iu=62500*Nx());var l=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&Fu(t,t.stylesheets),t.unsuspend)){var c=t.unsuspend;t.unsuspend=null,c()}},(t.imgBytes>Iu?50:800)+n);return t.unsuspend=a,function(){t.unsuspend=null,clearTimeout(s),clearTimeout(l)}}:null}function B0(t){if(t.count===0&&(t.imgCount===0||!t.waitingForImages)){if(t.stylesheets)Fu(t,t.stylesheets);else if(t.unsuspend){var n=t.unsuspend;t.unsuspend=null,n()}}}function Jo(){this.count--,B0(this)}function mM(){this.imgCount--,B0(this)}var Bu=null;function Fu(t,n){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Bu=new Map,n.forEach(_M,t),Bu=null,Jo.call(t))}function _M(t,n){if(!(n.state.loading&4)){var a=Bu.get(t);if(a)var s=a.get(null);else{a=new Map,Bu.set(t,a);for(var l=t.querySelectorAll("link[data-precedence],style[data-precedence]"),c=0;c<l.length;c++){var p=l[c];(p.nodeName==="LINK"||p.getAttribute("media")!=="not all")&&(a.set(p.dataset.precedence,p),s=p)}s&&a.set(null,s)}l=n.instance,p=l.getAttribute("data-precedence"),c=a.get(p)||s,c===s&&a.set(null,l),a.set(p,l),this.count++,s=Jo.bind(this),l.addEventListener("load",s),l.addEventListener("error",s),c?c.parentNode.insertBefore(l,c.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(l,t.firstChild)),n.state.loading|=4}}var Or={$$typeof:lt,Provider:null,Consumer:null,_currentValue:L,_currentValue2:L,_threadCount:0};function gM(t,n,a,s,l,c,p,E,N){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=ho(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ho(0),this.hiddenUpdates=ho(null),this.identifierPrefix=s,this.onUncaughtError=l,this.onCaughtError=c,this.onRecoverableError=p,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=N,this.transitionTypes=null,this.incompleteTransitions=new Map}function F0(t,n,a,s,l,c,p,E,N,q,et,pt){return t=new gM(t,n,a,p,N,q,et,pt,E),n=1,c===!0&&(n|=24),c=kn(3,null,null,n),t.current=c,c.stateNode=t,n=cf(),n.refCount++,t.pooledCache=n,n.refCount++,c.memoizedState={element:s,isDehydrated:a,cache:n},pf(c),t}function H0(t){return t?(t=rr,t):rr}function G0(t,n,a,s,l,c){l=H0(l),s.context===null?s.context=l:s.pendingContext=l,s=Oa(n),s.payload={element:a},c=c===void 0?null:c,c!==null&&(s.callback=c),a=Pa(t,s,n),a!==null&&(jn(a,t,n),wo(a,t,n))}function V0(t,n){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var a=t.retryLane;t.retryLane=a!==0&&a<n?a:n}}function Kh(t,n){V0(t,n),(t=t.alternate)&&V0(t,n)}function X0(t){if(t.tag===13||t.tag===31){var n=gs(t,67108864);n!==null&&jn(n,t,67108864),Kh(t,67108864)}}function k0(t){if(t.tag===13||t.tag===31){var n=ai();n=ot(n);var a=gs(t,n);a!==null&&jn(a,t,n),Kh(t,n)}}var Pr=!0;function vM(t,n,a,s){var l=Mt.T;Mt.T=null;var c=Yt.p;try{Yt.p=2,Qh(t,n,a,s)}finally{Yt.p=c,Mt.T=l}}function SM(t,n,a,s){var l=Mt.T;Mt.T=null;var c=Yt.p;try{Yt.p=8,Qh(t,n,a,s)}finally{Yt.p=c,Mt.T=l}}function Qh(t,n,a,s){if(Pr){var l=Jh(s);if(l===null)Nh(t,n,s,Hu,a),q0(t,s);else if(xM(l,t,n,a,s))s.stopPropagation();else if(q0(t,s),n&4&&-1<yM.indexOf(t)){for(;l!==null;){var c=me(l);if(c!==null)switch(c.tag){case 3:if(c=c.stateNode,c.current.memoizedState.isDehydrated){var p=ci(c.pendingLanes);if(p!==0){var E=c;for(E.pendingLanes|=2,E.entangledLanes|=2;p;){var N=1<<31-Un(p);E.entanglements[1]|=N,p&=~N}qi(c),(Le&6)===0&&(bu=G()+500,Yo(0))}}break;case 31:case 13:E=gs(c,2),E!==null&&jn(E,c,2),Cu(),Kh(c,2)}if(c=Jh(s),c===null&&Nh(t,n,s,Hu,a),c===l)break;l=c}l!==null&&s.stopPropagation()}else Nh(t,n,s,null,a)}}function Jh(t){return t=zc(t),$h(t)}var Hu=null;function $h(t){if(Hu=null,t=Ne(t),t!==null){var n=f(t);if(n===null)t=null;else{var a=n.tag;if(a===13){if(t=h(n),t!==null)return t;t=null}else if(a===31){if(t=d(n),t!==null)return t;t=null}else if(a===3){if(n.stateNode.current.memoizedState.isDehydrated)return n.tag===3?n.stateNode.containerInfo:null;t=null}else n!==t&&(t=null)}}return Hu=t,null}function Y0(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(bt()){case wt:return 2;case Gt:return 8;case yt:case mt:return 32;case qt:return 268435456;default:return 32}default:return 32}}var td=!1,Wa=null,ja=null,Za=null,$o=new Map,tl=new Map,Ka=[],yM="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function q0(t,n){switch(t){case"focusin":case"focusout":Wa=null;break;case"dragenter":case"dragleave":ja=null;break;case"mouseover":case"mouseout":Za=null;break;case"pointerover":case"pointerout":$o.delete(n.pointerId);break;case"gotpointercapture":case"lostpointercapture":tl.delete(n.pointerId)}}function el(t,n,a,s,l,c){return t===null||t.nativeEvent!==c?(t={blockedOn:n,domEventName:a,eventSystemFlags:s,nativeEvent:c,targetContainers:[l]},n!==null&&(n=me(n),n!==null&&X0(n)),t):(t.eventSystemFlags|=s,n=t.targetContainers,l!==null&&n.indexOf(l)===-1&&n.push(l),t)}function xM(t,n,a,s,l){switch(n){case"focusin":return Wa=el(Wa,t,n,a,s,l),!0;case"dragenter":return ja=el(ja,t,n,a,s,l),!0;case"mouseover":return Za=el(Za,t,n,a,s,l),!0;case"pointerover":var c=l.pointerId;return $o.set(c,el($o.get(c)||null,t,n,a,s,l)),!0;case"gotpointercapture":return c=l.pointerId,tl.set(c,el(tl.get(c)||null,t,n,a,s,l)),!0}return!1}function W0(t){var n=Ne(t.target);if(n!==null){var a=f(n);if(a!==null){if(n=a.tag,n===13){if(n=h(a),n!==null){t.blockedOn=n,Pt(t.priority,function(){k0(a)});return}}else if(n===31){if(n=d(a),n!==null){t.blockedOn=n,Pt(t.priority,function(){k0(a)});return}}else if(n===3&&a.stateNode.current.memoizedState.isDehydrated){t.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Gu(t){if(t.blockedOn!==null)return!1;for(var n=t.targetContainers;0<n.length;){var a=Jh(t.nativeEvent);if(a===null){a=t.nativeEvent;var s=new a.constructor(a.type,a);Pc=s,a.target.dispatchEvent(s),Pc=null}else return n=me(a),n!==null&&X0(n),t.blockedOn=a,!1;n.shift()}return!0}function j0(t,n,a){Gu(t)&&a.delete(n)}function MM(){td=!1,Wa!==null&&Gu(Wa)&&(Wa=null),ja!==null&&Gu(ja)&&(ja=null),Za!==null&&Gu(Za)&&(Za=null),$o.forEach(j0),tl.forEach(j0)}function Vu(t,n){t.blockedOn===n&&(t.blockedOn=null,td||(td=!0,o.unstable_scheduleCallback(o.unstable_NormalPriority,MM)))}var Xu=null;function Z0(t){Xu!==t&&(Xu=t,o.unstable_scheduleCallback(o.unstable_NormalPriority,function(){Xu===t&&(Xu=null);for(var n=0;n<t.length;n+=3){var a=t[n],s=t[n+1],l=t[n+2];if(typeof s!="function"){if($h(s||a)===null)continue;break}var c=me(a);c!==null&&(t.splice(n,3),n-=3,Pf(c,{pending:!0,data:l,method:a.method,action:s},s,l))}}))}function zr(t){function n(N){return Vu(N,t)}Wa!==null&&Vu(Wa,t),ja!==null&&Vu(ja,t),Za!==null&&Vu(Za,t),$o.forEach(n),tl.forEach(n);for(var a=0;a<Ka.length;a++){var s=Ka[a];s.blockedOn===t&&(s.blockedOn=null)}for(;0<Ka.length&&(a=Ka[0],a.blockedOn===null);)W0(a),a.blockedOn===null&&Ka.shift();if(a=(t.ownerDocument||t).$$reactFormReplay,a!=null)for(s=0;s<a.length;s+=3){var l=a[s],c=a[s+1],p=l[Xt]||null;if(typeof c=="function")p||Z0(a);else if(p){var E=null;if(c&&c.hasAttribute("formAction")){if(l=c,p=c[Xt]||null)E=p.formAction;else if($h(l)!==null)continue}else E=p.action;typeof E=="function"?a[s+1]=E:(a.splice(s,3),s-=3),Z0(a)}}}function K0(){function t(c){c.canIntercept&&c.info==="react-transition"&&c.intercept({handler:function(){return new Promise(function(p){return l=p})},focusReset:"manual",scroll:"manual"})}function n(){l!==null&&(l(),l=null),s||setTimeout(a,20)}function a(){if(!s&&!navigation.transition){var c=navigation.currentEntry;c&&c.url!=null&&navigation.navigate(c.url,{state:c.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var s=!1,l=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",n),navigation.addEventListener("navigateerror",n),setTimeout(a,100),function(){s=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",n),navigation.removeEventListener("navigateerror",n),l!==null&&(l(),l=null)}}}function ed(t){this._internalRoot=t}ku.prototype.render=ed.prototype.render=function(t){var n=this._internalRoot;if(n===null)throw Error(r(409));var a=n.current,s=ai();G0(a,s,t,n,null,null)},ku.prototype.unmount=ed.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var n=t.containerInfo;G0(t.current,2,null,t,null,null),Cu(),n[te]=null}};function ku(t){this._internalRoot=t}ku.prototype.unstable_scheduleHydration=function(t){if(t){var n=Et();t={blockedOn:null,target:t,priority:n};for(var a=0;a<Ka.length&&n!==0&&n<Ka[a].priority;a++);Ka.splice(a,0,t),a===0&&W0(t)}};var Q0=e.version;if(Q0!=="19.3.1")throw Error(r(527,Q0,"19.3.1"));Yt.findDOMNode=function(t){var n=t._reactInternals;if(n===void 0)throw typeof t.render=="function"?Error(r(188)):(t=Object.keys(t).join(","),Error(r(268,t)));return t=_(n),t=t!==null?S(t):null,t=t===null?null:t.stateNode,t};var EM={bundleType:0,version:"19.3.1",rendererPackageName:"react-dom",currentDispatcherRef:Mt,reconcilerVersion:"19.3.1"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Yu=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Yu.isDisabled&&Yu.supportsFiber)try{xe=Yu.inject(EM),$e=Yu}catch{}}return il.createRoot=function(t,n){if(!u(t))throw Error(r(299));var a=!1,s="",l=H_,c=G_,p=V_;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onUncaughtError!==void 0&&(l=n.onUncaughtError),n.onCaughtError!==void 0&&(c=n.onCaughtError),n.onRecoverableError!==void 0&&(p=n.onRecoverableError)),n=F0(t,1,!1,null,null,a,s,null,l,c,p,K0),t[te]=n.current,Uh(t),new ed(n)},il.hydrateRoot=function(t,n,a){if(!u(t))throw Error(r(299));var s=!1,l="",c=H_,p=G_,E=V_,N=null;return a!=null&&(a.unstable_strictMode===!0&&(s=!0),a.identifierPrefix!==void 0&&(l=a.identifierPrefix),a.onUncaughtError!==void 0&&(c=a.onUncaughtError),a.onCaughtError!==void 0&&(p=a.onCaughtError),a.onRecoverableError!==void 0&&(E=a.onRecoverableError),a.formState!==void 0&&(N=a.formState)),n=F0(t,1,!0,n,a??null,s,l,N,c,p,E,K0),n.context=H0(null),a=n.current,s=ai(),s=ot(s),l=Oa(s),l.callback=null,Pa(a,l,s),a=s,n.current.lanes=a,ps(n,a),qi(n),t[te]=n.current,Uh(t),new ku(n)},il.version="19.3.1",il}var ov;function LM(){if(ov)return ad.exports;ov=1;function o(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o)}catch(e){console.error(e)}}return o(),ad.exports=NM(),ad.exports}var OM=LM();const Up="180",eo={ROTATE:0,DOLLY:1,PAN:2},$r={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},PM=0,lv=1,zM=2,pS=1,IM=2,xa=3,ls=0,Kn=1,Ma=2,rs=0,no=1,uv=2,cv=3,fv=4,BM=5,Vs=100,FM=101,HM=102,GM=103,VM=104,XM=200,kM=201,YM=202,qM=203,Hd=204,Gd=205,WM=206,jM=207,ZM=208,KM=209,QM=210,JM=211,$M=212,tE=213,eE=214,Vd=0,Xd=1,kd=2,ao=3,Yd=4,qd=5,Wd=6,jd=7,mS=0,nE=1,iE=2,os=0,aE=1,sE=2,rE=3,oE=4,lE=5,uE=6,cE=7,_S=300,so=301,ro=302,Zd=303,Kd=304,Ac=306,Qd=1e3,ks=1001,Jd=1002,ui=1003,fE=1004,qu=1005,ji=1006,ld=1007,Ys=1008,Ji=1009,gS=1010,vS=1011,dl=1012,Np=1013,qs=1014,Zi=1015,Sl=1016,Lp=1017,Op=1018,pl=1020,SS=35902,yS=35899,xS=1021,MS=1022,Li=1023,ml=1026,_l=1027,Pp=1028,zp=1029,ES=1030,Ip=1031,Bp=1033,_c=33776,gc=33777,vc=33778,Sc=33779,$d=35840,tp=35841,ep=35842,np=35843,ip=36196,ap=37492,sp=37496,rp=37808,op=37809,lp=37810,up=37811,cp=37812,fp=37813,hp=37814,dp=37815,pp=37816,mp=37817,_p=37818,gp=37819,vp=37820,Sp=37821,yp=36492,xp=36494,Mp=36495,Ep=36283,Tp=36284,bp=36285,Ap=36286,hE=3200,dE=3201,TS=0,pE=1,ss="",li="srgb",oo="srgb-linear",Mc="linear",Ve="srgb",Ir=7680,hv=519,mE=512,_E=513,gE=514,bS=515,vE=516,SE=517,yE=518,xE=519,dv=35044,pv="300 es",Ki=2e3,Ec=2001;class Zs{addEventListener(e,i){this._listeners===void 0&&(this._listeners={});const r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(i)===-1&&r[e].push(i)}hasEventListener(e,i){const r=this._listeners;return r===void 0?!1:r[e]!==void 0&&r[e].indexOf(i)!==-1}removeEventListener(e,i){const r=this._listeners;if(r===void 0)return;const u=r[e];if(u!==void 0){const f=u.indexOf(i);f!==-1&&u.splice(f,1)}}dispatchEvent(e){const i=this._listeners;if(i===void 0)return;const r=i[e.type];if(r!==void 0){e.target=this;const u=r.slice(0);for(let f=0,h=u.length;f<h;f++)u[f].call(this,e);e.target=null}}}const On=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let mv=1234567;const fl=Math.PI/180,gl=180/Math.PI;function uo(){const o=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(On[o&255]+On[o>>8&255]+On[o>>16&255]+On[o>>24&255]+"-"+On[e&255]+On[e>>8&255]+"-"+On[e>>16&15|64]+On[e>>24&255]+"-"+On[i&63|128]+On[i>>8&255]+"-"+On[i>>16&255]+On[i>>24&255]+On[r&255]+On[r>>8&255]+On[r>>16&255]+On[r>>24&255]).toLowerCase()}function ve(o,e,i){return Math.max(e,Math.min(i,o))}function Fp(o,e){return(o%e+e)%e}function ME(o,e,i,r,u){return r+(o-e)*(u-r)/(i-e)}function EE(o,e,i){return o!==e?(i-o)/(e-o):0}function hl(o,e,i){return(1-i)*o+i*e}function TE(o,e,i,r){return hl(o,e,1-Math.exp(-i*r))}function bE(o,e=1){return e-Math.abs(Fp(o,e*2)-e)}function AE(o,e,i){return o<=e?0:o>=i?1:(o=(o-e)/(i-e),o*o*(3-2*o))}function RE(o,e,i){return o<=e?0:o>=i?1:(o=(o-e)/(i-e),o*o*o*(o*(o*6-15)+10))}function CE(o,e){return o+Math.floor(Math.random()*(e-o+1))}function wE(o,e){return o+Math.random()*(e-o)}function DE(o){return o*(.5-Math.random())}function UE(o){o!==void 0&&(mv=o);let e=mv+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function NE(o){return o*fl}function LE(o){return o*gl}function OE(o){return(o&o-1)===0&&o!==0}function PE(o){return Math.pow(2,Math.ceil(Math.log(o)/Math.LN2))}function zE(o){return Math.pow(2,Math.floor(Math.log(o)/Math.LN2))}function IE(o,e,i,r,u){const f=Math.cos,h=Math.sin,d=f(i/2),g=h(i/2),_=f((e+r)/2),S=h((e+r)/2),m=f((e-r)/2),y=h((e-r)/2),M=f((r-e)/2),A=h((r-e)/2);switch(u){case"XYX":o.set(d*S,g*m,g*y,d*_);break;case"YZY":o.set(g*y,d*S,g*m,d*_);break;case"ZXZ":o.set(g*m,g*y,d*S,d*_);break;case"XZX":o.set(d*S,g*A,g*M,d*_);break;case"YXY":o.set(g*M,d*S,g*A,d*_);break;case"ZYZ":o.set(g*A,g*M,d*S,d*_);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+u)}}function Jr(o,e){switch(e.constructor){case Float32Array:return o;case Uint32Array:return o/4294967295;case Uint16Array:return o/65535;case Uint8Array:return o/255;case Int32Array:return Math.max(o/2147483647,-1);case Int16Array:return Math.max(o/32767,-1);case Int8Array:return Math.max(o/127,-1);default:throw new Error("Invalid component type.")}}function Gn(o,e){switch(e.constructor){case Float32Array:return o;case Uint32Array:return Math.round(o*4294967295);case Uint16Array:return Math.round(o*65535);case Uint8Array:return Math.round(o*255);case Int32Array:return Math.round(o*2147483647);case Int16Array:return Math.round(o*32767);case Int8Array:return Math.round(o*127);default:throw new Error("Invalid component type.")}}const Rp={DEG2RAD:fl,RAD2DEG:gl,generateUUID:uo,clamp:ve,euclideanModulo:Fp,mapLinear:ME,inverseLerp:EE,lerp:hl,damp:TE,pingpong:bE,smoothstep:AE,smootherstep:RE,randInt:CE,randFloat:wE,randFloatSpread:DE,seededRandom:UE,degToRad:NE,radToDeg:LE,isPowerOfTwo:OE,ceilPowerOfTwo:PE,floorPowerOfTwo:zE,setQuaternionFromProperEuler:IE,normalize:Gn,denormalize:Jr};class ce{constructor(e=0,i=0){ce.prototype.isVector2=!0,this.x=e,this.y=i}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,i){return this.x=e,this.y=i,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,i){switch(e){case 0:this.x=i;break;case 1:this.y=i;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,i){return this.x=e.x+i.x,this.y=e.y+i.y,this}addScaledVector(e,i){return this.x+=e.x*i,this.y+=e.y*i,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,i){return this.x=e.x-i.x,this.y=e.y-i.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const i=this.x,r=this.y,u=e.elements;return this.x=u[0]*i+u[3]*r+u[6],this.y=u[1]*i+u[4]*r+u[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,i){return this.x=ve(this.x,e.x,i.x),this.y=ve(this.y,e.y,i.y),this}clampScalar(e,i){return this.x=ve(this.x,e,i),this.y=ve(this.y,e,i),this}clampLength(e,i){const r=this.length();return this.divideScalar(r||1).multiplyScalar(ve(r,e,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const i=Math.sqrt(this.lengthSq()*e.lengthSq());if(i===0)return Math.PI/2;const r=this.dot(e)/i;return Math.acos(ve(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const i=this.x-e.x,r=this.y-e.y;return i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,i){return this.x+=(e.x-this.x)*i,this.y+=(e.y-this.y)*i,this}lerpVectors(e,i,r){return this.x=e.x+(i.x-e.x)*r,this.y=e.y+(i.y-e.y)*r,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,i=0){return this.x=e[i],this.y=e[i+1],this}toArray(e=[],i=0){return e[i]=this.x,e[i+1]=this.y,e}fromBufferAttribute(e,i){return this.x=e.getX(i),this.y=e.getY(i),this}rotateAround(e,i){const r=Math.cos(i),u=Math.sin(i),f=this.x-e.x,h=this.y-e.y;return this.x=f*r-h*u+e.x,this.y=f*u+h*r+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ws{constructor(e=0,i=0,r=0,u=1){this.isQuaternion=!0,this._x=e,this._y=i,this._z=r,this._w=u}static slerpFlat(e,i,r,u,f,h,d){let g=r[u+0],_=r[u+1],S=r[u+2],m=r[u+3];const y=f[h+0],M=f[h+1],A=f[h+2],R=f[h+3];if(d===0){e[i+0]=g,e[i+1]=_,e[i+2]=S,e[i+3]=m;return}if(d===1){e[i+0]=y,e[i+1]=M,e[i+2]=A,e[i+3]=R;return}if(m!==R||g!==y||_!==M||S!==A){let x=1-d;const v=g*y+_*M+S*A+m*R,z=v>=0?1:-1,P=1-v*v;if(P>Number.EPSILON){const H=Math.sqrt(P),B=Math.atan2(H,v*z);x=Math.sin(x*B)/H,d=Math.sin(d*B)/H}const D=d*z;if(g=g*x+y*D,_=_*x+M*D,S=S*x+A*D,m=m*x+R*D,x===1-d){const H=1/Math.sqrt(g*g+_*_+S*S+m*m);g*=H,_*=H,S*=H,m*=H}}e[i]=g,e[i+1]=_,e[i+2]=S,e[i+3]=m}static multiplyQuaternionsFlat(e,i,r,u,f,h){const d=r[u],g=r[u+1],_=r[u+2],S=r[u+3],m=f[h],y=f[h+1],M=f[h+2],A=f[h+3];return e[i]=d*A+S*m+g*M-_*y,e[i+1]=g*A+S*y+_*m-d*M,e[i+2]=_*A+S*M+d*y-g*m,e[i+3]=S*A-d*m-g*y-_*M,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,i,r,u){return this._x=e,this._y=i,this._z=r,this._w=u,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,i=!0){const r=e._x,u=e._y,f=e._z,h=e._order,d=Math.cos,g=Math.sin,_=d(r/2),S=d(u/2),m=d(f/2),y=g(r/2),M=g(u/2),A=g(f/2);switch(h){case"XYZ":this._x=y*S*m+_*M*A,this._y=_*M*m-y*S*A,this._z=_*S*A+y*M*m,this._w=_*S*m-y*M*A;break;case"YXZ":this._x=y*S*m+_*M*A,this._y=_*M*m-y*S*A,this._z=_*S*A-y*M*m,this._w=_*S*m+y*M*A;break;case"ZXY":this._x=y*S*m-_*M*A,this._y=_*M*m+y*S*A,this._z=_*S*A+y*M*m,this._w=_*S*m-y*M*A;break;case"ZYX":this._x=y*S*m-_*M*A,this._y=_*M*m+y*S*A,this._z=_*S*A-y*M*m,this._w=_*S*m+y*M*A;break;case"YZX":this._x=y*S*m+_*M*A,this._y=_*M*m+y*S*A,this._z=_*S*A-y*M*m,this._w=_*S*m-y*M*A;break;case"XZY":this._x=y*S*m-_*M*A,this._y=_*M*m-y*S*A,this._z=_*S*A+y*M*m,this._w=_*S*m+y*M*A;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+h)}return i===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,i){const r=i/2,u=Math.sin(r);return this._x=e.x*u,this._y=e.y*u,this._z=e.z*u,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){const i=e.elements,r=i[0],u=i[4],f=i[8],h=i[1],d=i[5],g=i[9],_=i[2],S=i[6],m=i[10],y=r+d+m;if(y>0){const M=.5/Math.sqrt(y+1);this._w=.25/M,this._x=(S-g)*M,this._y=(f-_)*M,this._z=(h-u)*M}else if(r>d&&r>m){const M=2*Math.sqrt(1+r-d-m);this._w=(S-g)/M,this._x=.25*M,this._y=(u+h)/M,this._z=(f+_)/M}else if(d>m){const M=2*Math.sqrt(1+d-r-m);this._w=(f-_)/M,this._x=(u+h)/M,this._y=.25*M,this._z=(g+S)/M}else{const M=2*Math.sqrt(1+m-r-d);this._w=(h-u)/M,this._x=(f+_)/M,this._y=(g+S)/M,this._z=.25*M}return this._onChangeCallback(),this}setFromUnitVectors(e,i){let r=e.dot(i)+1;return r<1e-8?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*i.z-e.z*i.y,this._y=e.z*i.x-e.x*i.z,this._z=e.x*i.y-e.y*i.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ve(this.dot(e),-1,1)))}rotateTowards(e,i){const r=this.angleTo(e);if(r===0)return this;const u=Math.min(1,i/r);return this.slerp(e,u),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,i){const r=e._x,u=e._y,f=e._z,h=e._w,d=i._x,g=i._y,_=i._z,S=i._w;return this._x=r*S+h*d+u*_-f*g,this._y=u*S+h*g+f*d-r*_,this._z=f*S+h*_+r*g-u*d,this._w=h*S-r*d-u*g-f*_,this._onChangeCallback(),this}slerp(e,i){if(i===0)return this;if(i===1)return this.copy(e);const r=this._x,u=this._y,f=this._z,h=this._w;let d=h*e._w+r*e._x+u*e._y+f*e._z;if(d<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,d=-d):this.copy(e),d>=1)return this._w=h,this._x=r,this._y=u,this._z=f,this;const g=1-d*d;if(g<=Number.EPSILON){const M=1-i;return this._w=M*h+i*this._w,this._x=M*r+i*this._x,this._y=M*u+i*this._y,this._z=M*f+i*this._z,this.normalize(),this}const _=Math.sqrt(g),S=Math.atan2(_,d),m=Math.sin((1-i)*S)/_,y=Math.sin(i*S)/_;return this._w=h*m+this._w*y,this._x=r*m+this._x*y,this._y=u*m+this._y*y,this._z=f*m+this._z*y,this._onChangeCallback(),this}slerpQuaternions(e,i,r){return this.copy(e).slerp(i,r)}random(){const e=2*Math.PI*Math.random(),i=2*Math.PI*Math.random(),r=Math.random(),u=Math.sqrt(1-r),f=Math.sqrt(r);return this.set(u*Math.sin(e),u*Math.cos(e),f*Math.sin(i),f*Math.cos(i))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,i=0){return this._x=e[i],this._y=e[i+1],this._z=e[i+2],this._w=e[i+3],this._onChangeCallback(),this}toArray(e=[],i=0){return e[i]=this._x,e[i+1]=this._y,e[i+2]=this._z,e[i+3]=this._w,e}fromBufferAttribute(e,i){return this._x=e.getX(i),this._y=e.getY(i),this._z=e.getZ(i),this._w=e.getW(i),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class nt{constructor(e=0,i=0,r=0){nt.prototype.isVector3=!0,this.x=e,this.y=i,this.z=r}set(e,i,r){return r===void 0&&(r=this.z),this.x=e,this.y=i,this.z=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,i){switch(e){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,i){return this.x=e.x+i.x,this.y=e.y+i.y,this.z=e.z+i.z,this}addScaledVector(e,i){return this.x+=e.x*i,this.y+=e.y*i,this.z+=e.z*i,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,i){return this.x=e.x-i.x,this.y=e.y-i.y,this.z=e.z-i.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,i){return this.x=e.x*i.x,this.y=e.y*i.y,this.z=e.z*i.z,this}applyEuler(e){return this.applyQuaternion(_v.setFromEuler(e))}applyAxisAngle(e,i){return this.applyQuaternion(_v.setFromAxisAngle(e,i))}applyMatrix3(e){const i=this.x,r=this.y,u=this.z,f=e.elements;return this.x=f[0]*i+f[3]*r+f[6]*u,this.y=f[1]*i+f[4]*r+f[7]*u,this.z=f[2]*i+f[5]*r+f[8]*u,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const i=this.x,r=this.y,u=this.z,f=e.elements,h=1/(f[3]*i+f[7]*r+f[11]*u+f[15]);return this.x=(f[0]*i+f[4]*r+f[8]*u+f[12])*h,this.y=(f[1]*i+f[5]*r+f[9]*u+f[13])*h,this.z=(f[2]*i+f[6]*r+f[10]*u+f[14])*h,this}applyQuaternion(e){const i=this.x,r=this.y,u=this.z,f=e.x,h=e.y,d=e.z,g=e.w,_=2*(h*u-d*r),S=2*(d*i-f*u),m=2*(f*r-h*i);return this.x=i+g*_+h*m-d*S,this.y=r+g*S+d*_-f*m,this.z=u+g*m+f*S-h*_,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const i=this.x,r=this.y,u=this.z,f=e.elements;return this.x=f[0]*i+f[4]*r+f[8]*u,this.y=f[1]*i+f[5]*r+f[9]*u,this.z=f[2]*i+f[6]*r+f[10]*u,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,i){return this.x=ve(this.x,e.x,i.x),this.y=ve(this.y,e.y,i.y),this.z=ve(this.z,e.z,i.z),this}clampScalar(e,i){return this.x=ve(this.x,e,i),this.y=ve(this.y,e,i),this.z=ve(this.z,e,i),this}clampLength(e,i){const r=this.length();return this.divideScalar(r||1).multiplyScalar(ve(r,e,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,i){return this.x+=(e.x-this.x)*i,this.y+=(e.y-this.y)*i,this.z+=(e.z-this.z)*i,this}lerpVectors(e,i,r){return this.x=e.x+(i.x-e.x)*r,this.y=e.y+(i.y-e.y)*r,this.z=e.z+(i.z-e.z)*r,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,i){const r=e.x,u=e.y,f=e.z,h=i.x,d=i.y,g=i.z;return this.x=u*g-f*d,this.y=f*h-r*g,this.z=r*d-u*h,this}projectOnVector(e){const i=e.lengthSq();if(i===0)return this.set(0,0,0);const r=e.dot(this)/i;return this.copy(e).multiplyScalar(r)}projectOnPlane(e){return ud.copy(this).projectOnVector(e),this.sub(ud)}reflect(e){return this.sub(ud.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const i=Math.sqrt(this.lengthSq()*e.lengthSq());if(i===0)return Math.PI/2;const r=this.dot(e)/i;return Math.acos(ve(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const i=this.x-e.x,r=this.y-e.y,u=this.z-e.z;return i*i+r*r+u*u}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,i,r){const u=Math.sin(i)*e;return this.x=u*Math.sin(r),this.y=Math.cos(i)*e,this.z=u*Math.cos(r),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,i,r){return this.x=e*Math.sin(i),this.y=r,this.z=e*Math.cos(i),this}setFromMatrixPosition(e){const i=e.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this}setFromMatrixScale(e){const i=this.setFromMatrixColumn(e,0).length(),r=this.setFromMatrixColumn(e,1).length(),u=this.setFromMatrixColumn(e,2).length();return this.x=i,this.y=r,this.z=u,this}setFromMatrixColumn(e,i){return this.fromArray(e.elements,i*4)}setFromMatrix3Column(e,i){return this.fromArray(e.elements,i*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,i=0){return this.x=e[i],this.y=e[i+1],this.z=e[i+2],this}toArray(e=[],i=0){return e[i]=this.x,e[i+1]=this.y,e[i+2]=this.z,e}fromBufferAttribute(e,i){return this.x=e.getX(i),this.y=e.getY(i),this.z=e.getZ(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,i=Math.random()*2-1,r=Math.sqrt(1-i*i);return this.x=r*Math.cos(e),this.y=i,this.z=r*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ud=new nt,_v=new Ws;class de{constructor(e,i,r,u,f,h,d,g,_){de.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,i,r,u,f,h,d,g,_)}set(e,i,r,u,f,h,d,g,_){const S=this.elements;return S[0]=e,S[1]=u,S[2]=d,S[3]=i,S[4]=f,S[5]=g,S[6]=r,S[7]=h,S[8]=_,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const i=this.elements,r=e.elements;return i[0]=r[0],i[1]=r[1],i[2]=r[2],i[3]=r[3],i[4]=r[4],i[5]=r[5],i[6]=r[6],i[7]=r[7],i[8]=r[8],this}extractBasis(e,i,r){return e.setFromMatrix3Column(this,0),i.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const i=e.elements;return this.set(i[0],i[4],i[8],i[1],i[5],i[9],i[2],i[6],i[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,i){const r=e.elements,u=i.elements,f=this.elements,h=r[0],d=r[3],g=r[6],_=r[1],S=r[4],m=r[7],y=r[2],M=r[5],A=r[8],R=u[0],x=u[3],v=u[6],z=u[1],P=u[4],D=u[7],H=u[2],B=u[5],O=u[8];return f[0]=h*R+d*z+g*H,f[3]=h*x+d*P+g*B,f[6]=h*v+d*D+g*O,f[1]=_*R+S*z+m*H,f[4]=_*x+S*P+m*B,f[7]=_*v+S*D+m*O,f[2]=y*R+M*z+A*H,f[5]=y*x+M*P+A*B,f[8]=y*v+M*D+A*O,this}multiplyScalar(e){const i=this.elements;return i[0]*=e,i[3]*=e,i[6]*=e,i[1]*=e,i[4]*=e,i[7]*=e,i[2]*=e,i[5]*=e,i[8]*=e,this}determinant(){const e=this.elements,i=e[0],r=e[1],u=e[2],f=e[3],h=e[4],d=e[5],g=e[6],_=e[7],S=e[8];return i*h*S-i*d*_-r*f*S+r*d*g+u*f*_-u*h*g}invert(){const e=this.elements,i=e[0],r=e[1],u=e[2],f=e[3],h=e[4],d=e[5],g=e[6],_=e[7],S=e[8],m=S*h-d*_,y=d*g-S*f,M=_*f-h*g,A=i*m+r*y+u*M;if(A===0)return this.set(0,0,0,0,0,0,0,0,0);const R=1/A;return e[0]=m*R,e[1]=(u*_-S*r)*R,e[2]=(d*r-u*h)*R,e[3]=y*R,e[4]=(S*i-u*g)*R,e[5]=(u*f-d*i)*R,e[6]=M*R,e[7]=(r*g-_*i)*R,e[8]=(h*i-r*f)*R,this}transpose(){let e;const i=this.elements;return e=i[1],i[1]=i[3],i[3]=e,e=i[2],i[2]=i[6],i[6]=e,e=i[5],i[5]=i[7],i[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const i=this.elements;return e[0]=i[0],e[1]=i[3],e[2]=i[6],e[3]=i[1],e[4]=i[4],e[5]=i[7],e[6]=i[2],e[7]=i[5],e[8]=i[8],this}setUvTransform(e,i,r,u,f,h,d){const g=Math.cos(f),_=Math.sin(f);return this.set(r*g,r*_,-r*(g*h+_*d)+h+e,-u*_,u*g,-u*(-_*h+g*d)+d+i,0,0,1),this}scale(e,i){return this.premultiply(cd.makeScale(e,i)),this}rotate(e){return this.premultiply(cd.makeRotation(-e)),this}translate(e,i){return this.premultiply(cd.makeTranslation(e,i)),this}makeTranslation(e,i){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,i,0,0,1),this}makeRotation(e){const i=Math.cos(e),r=Math.sin(e);return this.set(i,-r,0,r,i,0,0,0,1),this}makeScale(e,i){return this.set(e,0,0,0,i,0,0,0,1),this}equals(e){const i=this.elements,r=e.elements;for(let u=0;u<9;u++)if(i[u]!==r[u])return!1;return!0}fromArray(e,i=0){for(let r=0;r<9;r++)this.elements[r]=e[r+i];return this}toArray(e=[],i=0){const r=this.elements;return e[i]=r[0],e[i+1]=r[1],e[i+2]=r[2],e[i+3]=r[3],e[i+4]=r[4],e[i+5]=r[5],e[i+6]=r[6],e[i+7]=r[7],e[i+8]=r[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const cd=new de;function AS(o){for(let e=o.length-1;e>=0;--e)if(o[e]>=65535)return!0;return!1}function Tc(o){return document.createElementNS("http://www.w3.org/1999/xhtml",o)}function BE(){const o=Tc("canvas");return o.style.display="block",o}const gv={};function vl(o){o in gv||(gv[o]=!0,console.warn(o))}function FE(o,e,i){return new Promise(function(r,u){function f(){switch(o.clientWaitSync(e,o.SYNC_FLUSH_COMMANDS_BIT,0)){case o.WAIT_FAILED:u();break;case o.TIMEOUT_EXPIRED:setTimeout(f,i);break;default:r()}}setTimeout(f,i)})}const vv=new de().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Sv=new de().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function HE(){const o={enabled:!0,workingColorSpace:oo,spaces:{},convert:function(u,f,h){return this.enabled===!1||f===h||!f||!h||(this.spaces[f].transfer===Ve&&(u.r=Ea(u.r),u.g=Ea(u.g),u.b=Ea(u.b)),this.spaces[f].primaries!==this.spaces[h].primaries&&(u.applyMatrix3(this.spaces[f].toXYZ),u.applyMatrix3(this.spaces[h].fromXYZ)),this.spaces[h].transfer===Ve&&(u.r=io(u.r),u.g=io(u.g),u.b=io(u.b))),u},workingToColorSpace:function(u,f){return this.convert(u,this.workingColorSpace,f)},colorSpaceToWorking:function(u,f){return this.convert(u,f,this.workingColorSpace)},getPrimaries:function(u){return this.spaces[u].primaries},getTransfer:function(u){return u===ss?Mc:this.spaces[u].transfer},getToneMappingMode:function(u){return this.spaces[u].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(u,f=this.workingColorSpace){return u.fromArray(this.spaces[f].luminanceCoefficients)},define:function(u){Object.assign(this.spaces,u)},_getMatrix:function(u,f,h){return u.copy(this.spaces[f].toXYZ).multiply(this.spaces[h].fromXYZ)},_getDrawingBufferColorSpace:function(u){return this.spaces[u].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(u=this.workingColorSpace){return this.spaces[u].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(u,f){return vl("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),o.workingToColorSpace(u,f)},toWorkingColorSpace:function(u,f){return vl("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),o.colorSpaceToWorking(u,f)}},e=[.64,.33,.3,.6,.15,.06],i=[.2126,.7152,.0722],r=[.3127,.329];return o.define({[oo]:{primaries:e,whitePoint:r,transfer:Mc,toXYZ:vv,fromXYZ:Sv,luminanceCoefficients:i,workingColorSpaceConfig:{unpackColorSpace:li},outputColorSpaceConfig:{drawingBufferColorSpace:li}},[li]:{primaries:e,whitePoint:r,transfer:Ve,toXYZ:vv,fromXYZ:Sv,luminanceCoefficients:i,outputColorSpaceConfig:{drawingBufferColorSpace:li}}}),o}const we=HE();function Ea(o){return o<.04045?o*.0773993808:Math.pow(o*.9478672986+.0521327014,2.4)}function io(o){return o<.0031308?o*12.92:1.055*Math.pow(o,.41666)-.055}let Br;class GE{static getDataURL(e,i="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let r;if(e instanceof HTMLCanvasElement)r=e;else{Br===void 0&&(Br=Tc("canvas")),Br.width=e.width,Br.height=e.height;const u=Br.getContext("2d");e instanceof ImageData?u.putImageData(e,0,0):u.drawImage(e,0,0,e.width,e.height),r=Br}return r.toDataURL(i)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const i=Tc("canvas");i.width=e.width,i.height=e.height;const r=i.getContext("2d");r.drawImage(e,0,0,e.width,e.height);const u=r.getImageData(0,0,e.width,e.height),f=u.data;for(let h=0;h<f.length;h++)f[h]=Ea(f[h]/255)*255;return r.putImageData(u,0,0),i}else if(e.data){const i=e.data.slice(0);for(let r=0;r<i.length;r++)i instanceof Uint8Array||i instanceof Uint8ClampedArray?i[r]=Math.floor(Ea(i[r]/255)*255):i[r]=Ea(i[r]);return{data:i,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let VE=0;class Hp{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:VE++}),this.uuid=uo(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const i=this.data;return typeof HTMLVideoElement<"u"&&i instanceof HTMLVideoElement?e.set(i.videoWidth,i.videoHeight,0):i instanceof VideoFrame?e.set(i.displayHeight,i.displayWidth,0):i!==null?e.set(i.width,i.height,i.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const i=e===void 0||typeof e=="string";if(!i&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const r={uuid:this.uuid,url:""},u=this.data;if(u!==null){let f;if(Array.isArray(u)){f=[];for(let h=0,d=u.length;h<d;h++)u[h].isDataTexture?f.push(fd(u[h].image)):f.push(fd(u[h]))}else f=fd(u);r.url=f}return i||(e.images[this.uuid]=r),r}}function fd(o){return typeof HTMLImageElement<"u"&&o instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&o instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&o instanceof ImageBitmap?GE.getDataURL(o):o.data?{data:Array.from(o.data),width:o.width,height:o.height,type:o.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let XE=0;const hd=new nt;class Xn extends Zs{constructor(e=Xn.DEFAULT_IMAGE,i=Xn.DEFAULT_MAPPING,r=ks,u=ks,f=ji,h=Ys,d=Li,g=Ji,_=Xn.DEFAULT_ANISOTROPY,S=ss){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:XE++}),this.uuid=uo(),this.name="",this.source=new Hp(e),this.mipmaps=[],this.mapping=i,this.channel=0,this.wrapS=r,this.wrapT=u,this.magFilter=f,this.minFilter=h,this.anisotropy=_,this.format=d,this.internalFormat=null,this.type=g,this.offset=new ce(0,0),this.repeat=new ce(1,1),this.center=new ce(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new de,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=S,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(hd).x}get height(){return this.source.getSize(hd).y}get depth(){return this.source.getSize(hd).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,i){this.updateRanges.push({start:e,count:i})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const i in e){const r=e[i];if(r===void 0){console.warn(`THREE.Texture.setValues(): parameter '${i}' has value of undefined.`);continue}const u=this[i];if(u===void 0){console.warn(`THREE.Texture.setValues(): property '${i}' does not exist.`);continue}u&&r&&u.isVector2&&r.isVector2||u&&r&&u.isVector3&&r.isVector3||u&&r&&u.isMatrix3&&r.isMatrix3?u.copy(r):this[i]=r}}toJSON(e){const i=e===void 0||typeof e=="string";if(!i&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const r={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),i||(e.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==_S)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Qd:e.x=e.x-Math.floor(e.x);break;case ks:e.x=e.x<0?0:1;break;case Jd:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Qd:e.y=e.y-Math.floor(e.y);break;case ks:e.y=e.y<0?0:1;break;case Jd:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Xn.DEFAULT_IMAGE=null;Xn.DEFAULT_MAPPING=_S;Xn.DEFAULT_ANISOTROPY=1;class sn{constructor(e=0,i=0,r=0,u=1){sn.prototype.isVector4=!0,this.x=e,this.y=i,this.z=r,this.w=u}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,i,r,u){return this.x=e,this.y=i,this.z=r,this.w=u,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,i){switch(e){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;case 3:this.w=i;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,i){return this.x=e.x+i.x,this.y=e.y+i.y,this.z=e.z+i.z,this.w=e.w+i.w,this}addScaledVector(e,i){return this.x+=e.x*i,this.y+=e.y*i,this.z+=e.z*i,this.w+=e.w*i,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,i){return this.x=e.x-i.x,this.y=e.y-i.y,this.z=e.z-i.z,this.w=e.w-i.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const i=this.x,r=this.y,u=this.z,f=this.w,h=e.elements;return this.x=h[0]*i+h[4]*r+h[8]*u+h[12]*f,this.y=h[1]*i+h[5]*r+h[9]*u+h[13]*f,this.z=h[2]*i+h[6]*r+h[10]*u+h[14]*f,this.w=h[3]*i+h[7]*r+h[11]*u+h[15]*f,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const i=Math.sqrt(1-e.w*e.w);return i<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/i,this.y=e.y/i,this.z=e.z/i),this}setAxisAngleFromRotationMatrix(e){let i,r,u,f;const g=e.elements,_=g[0],S=g[4],m=g[8],y=g[1],M=g[5],A=g[9],R=g[2],x=g[6],v=g[10];if(Math.abs(S-y)<.01&&Math.abs(m-R)<.01&&Math.abs(A-x)<.01){if(Math.abs(S+y)<.1&&Math.abs(m+R)<.1&&Math.abs(A+x)<.1&&Math.abs(_+M+v-3)<.1)return this.set(1,0,0,0),this;i=Math.PI;const P=(_+1)/2,D=(M+1)/2,H=(v+1)/2,B=(S+y)/4,O=(m+R)/4,k=(A+x)/4;return P>D&&P>H?P<.01?(r=0,u=.707106781,f=.707106781):(r=Math.sqrt(P),u=B/r,f=O/r):D>H?D<.01?(r=.707106781,u=0,f=.707106781):(u=Math.sqrt(D),r=B/u,f=k/u):H<.01?(r=.707106781,u=.707106781,f=0):(f=Math.sqrt(H),r=O/f,u=k/f),this.set(r,u,f,i),this}let z=Math.sqrt((x-A)*(x-A)+(m-R)*(m-R)+(y-S)*(y-S));return Math.abs(z)<.001&&(z=1),this.x=(x-A)/z,this.y=(m-R)/z,this.z=(y-S)/z,this.w=Math.acos((_+M+v-1)/2),this}setFromMatrixPosition(e){const i=e.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this.w=i[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,i){return this.x=ve(this.x,e.x,i.x),this.y=ve(this.y,e.y,i.y),this.z=ve(this.z,e.z,i.z),this.w=ve(this.w,e.w,i.w),this}clampScalar(e,i){return this.x=ve(this.x,e,i),this.y=ve(this.y,e,i),this.z=ve(this.z,e,i),this.w=ve(this.w,e,i),this}clampLength(e,i){const r=this.length();return this.divideScalar(r||1).multiplyScalar(ve(r,e,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,i){return this.x+=(e.x-this.x)*i,this.y+=(e.y-this.y)*i,this.z+=(e.z-this.z)*i,this.w+=(e.w-this.w)*i,this}lerpVectors(e,i,r){return this.x=e.x+(i.x-e.x)*r,this.y=e.y+(i.y-e.y)*r,this.z=e.z+(i.z-e.z)*r,this.w=e.w+(i.w-e.w)*r,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,i=0){return this.x=e[i],this.y=e[i+1],this.z=e[i+2],this.w=e[i+3],this}toArray(e=[],i=0){return e[i]=this.x,e[i+1]=this.y,e[i+2]=this.z,e[i+3]=this.w,e}fromBufferAttribute(e,i){return this.x=e.getX(i),this.y=e.getY(i),this.z=e.getZ(i),this.w=e.getW(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class kE extends Zs{constructor(e=1,i=1,r={}){super(),r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ji,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},r),this.isRenderTarget=!0,this.width=e,this.height=i,this.depth=r.depth,this.scissor=new sn(0,0,e,i),this.scissorTest=!1,this.viewport=new sn(0,0,e,i);const u={width:e,height:i,depth:r.depth},f=new Xn(u);this.textures=[];const h=r.count;for(let d=0;d<h;d++)this.textures[d]=f.clone(),this.textures[d].isRenderTargetTexture=!0,this.textures[d].renderTarget=this;this._setTextureOptions(r),this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=r.depthTexture,this.samples=r.samples,this.multiview=r.multiview}_setTextureOptions(e={}){const i={minFilter:ji,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(i.mapping=e.mapping),e.wrapS!==void 0&&(i.wrapS=e.wrapS),e.wrapT!==void 0&&(i.wrapT=e.wrapT),e.wrapR!==void 0&&(i.wrapR=e.wrapR),e.magFilter!==void 0&&(i.magFilter=e.magFilter),e.minFilter!==void 0&&(i.minFilter=e.minFilter),e.format!==void 0&&(i.format=e.format),e.type!==void 0&&(i.type=e.type),e.anisotropy!==void 0&&(i.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(i.colorSpace=e.colorSpace),e.flipY!==void 0&&(i.flipY=e.flipY),e.generateMipmaps!==void 0&&(i.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(i.internalFormat=e.internalFormat);for(let r=0;r<this.textures.length;r++)this.textures[r].setValues(i)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,i,r=1){if(this.width!==e||this.height!==i||this.depth!==r){this.width=e,this.height=i,this.depth=r;for(let u=0,f=this.textures.length;u<f;u++)this.textures[u].image.width=e,this.textures[u].image.height=i,this.textures[u].image.depth=r,this.textures[u].isArrayTexture=this.textures[u].image.depth>1;this.dispose()}this.viewport.set(0,0,e,i),this.scissor.set(0,0,e,i)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++){this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;const u=Object.assign({},e.textures[i].image);this.textures[i].source=new Hp(u)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class js extends kE{constructor(e=1,i=1,r={}){super(e,i,r),this.isWebGLRenderTarget=!0}}class RS extends Xn{constructor(e=null,i=1,r=1,u=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:i,height:r,depth:u},this.magFilter=ui,this.minFilter=ui,this.wrapR=ks,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class YE extends Xn{constructor(e=null,i=1,r=1,u=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:i,height:r,depth:u},this.magFilter=ui,this.minFilter=ui,this.wrapR=ks,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ks{constructor(e=new nt(1/0,1/0,1/0),i=new nt(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=i}set(e,i){return this.min.copy(e),this.max.copy(i),this}setFromArray(e){this.makeEmpty();for(let i=0,r=e.length;i<r;i+=3)this.expandByPoint(wi.fromArray(e,i));return this}setFromBufferAttribute(e){this.makeEmpty();for(let i=0,r=e.count;i<r;i++)this.expandByPoint(wi.fromBufferAttribute(e,i));return this}setFromPoints(e){this.makeEmpty();for(let i=0,r=e.length;i<r;i++)this.expandByPoint(e[i]);return this}setFromCenterAndSize(e,i){const r=wi.copy(i).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,i=!1){return this.makeEmpty(),this.expandByObject(e,i)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,i=!1){e.updateWorldMatrix(!1,!1);const r=e.geometry;if(r!==void 0){const f=r.getAttribute("position");if(i===!0&&f!==void 0&&e.isInstancedMesh!==!0)for(let h=0,d=f.count;h<d;h++)e.isMesh===!0?e.getVertexPosition(h,wi):wi.fromBufferAttribute(f,h),wi.applyMatrix4(e.matrixWorld),this.expandByPoint(wi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Wu.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),Wu.copy(r.boundingBox)),Wu.applyMatrix4(e.matrixWorld),this.union(Wu)}const u=e.children;for(let f=0,h=u.length;f<h;f++)this.expandByObject(u[f],i);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,i){return i.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,wi),wi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let i,r;return e.normal.x>0?(i=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(i=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(i+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(i+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(i+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(i+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),i<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(al),ju.subVectors(this.max,al),Fr.subVectors(e.a,al),Hr.subVectors(e.b,al),Gr.subVectors(e.c,al),Ja.subVectors(Hr,Fr),$a.subVectors(Gr,Hr),Ps.subVectors(Fr,Gr);let i=[0,-Ja.z,Ja.y,0,-$a.z,$a.y,0,-Ps.z,Ps.y,Ja.z,0,-Ja.x,$a.z,0,-$a.x,Ps.z,0,-Ps.x,-Ja.y,Ja.x,0,-$a.y,$a.x,0,-Ps.y,Ps.x,0];return!dd(i,Fr,Hr,Gr,ju)||(i=[1,0,0,0,1,0,0,0,1],!dd(i,Fr,Hr,Gr,ju))?!1:(Zu.crossVectors(Ja,$a),i=[Zu.x,Zu.y,Zu.z],dd(i,Fr,Hr,Gr,ju))}clampPoint(e,i){return i.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,wi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(wi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(_a[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),_a[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),_a[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),_a[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),_a[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),_a[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),_a[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),_a[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(_a),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const _a=[new nt,new nt,new nt,new nt,new nt,new nt,new nt,new nt],wi=new nt,Wu=new Ks,Fr=new nt,Hr=new nt,Gr=new nt,Ja=new nt,$a=new nt,Ps=new nt,al=new nt,ju=new nt,Zu=new nt,zs=new nt;function dd(o,e,i,r,u){for(let f=0,h=o.length-3;f<=h;f+=3){zs.fromArray(o,f);const d=u.x*Math.abs(zs.x)+u.y*Math.abs(zs.y)+u.z*Math.abs(zs.z),g=e.dot(zs),_=i.dot(zs),S=r.dot(zs);if(Math.max(-Math.max(g,_,S),Math.min(g,_,S))>d)return!1}return!0}const qE=new Ks,sl=new nt,pd=new nt;class yl{constructor(e=new nt,i=-1){this.isSphere=!0,this.center=e,this.radius=i}set(e,i){return this.center.copy(e),this.radius=i,this}setFromPoints(e,i){const r=this.center;i!==void 0?r.copy(i):qE.setFromPoints(e).getCenter(r);let u=0;for(let f=0,h=e.length;f<h;f++)u=Math.max(u,r.distanceToSquared(e[f]));return this.radius=Math.sqrt(u),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const i=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=i*i}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,i){const r=this.center.distanceToSquared(e);return i.copy(e),r>this.radius*this.radius&&(i.sub(this.center).normalize(),i.multiplyScalar(this.radius).add(this.center)),i}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;sl.subVectors(e,this.center);const i=sl.lengthSq();if(i>this.radius*this.radius){const r=Math.sqrt(i),u=(r-this.radius)*.5;this.center.addScaledVector(sl,u/r),this.radius+=u}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(pd.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(sl.copy(e.center).add(pd)),this.expandByPoint(sl.copy(e.center).sub(pd))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const ga=new nt,md=new nt,Ku=new nt,ts=new nt,_d=new nt,Qu=new nt,gd=new nt;class Gp{constructor(e=new nt,i=new nt(0,0,-1)){this.origin=e,this.direction=i}set(e,i){return this.origin.copy(e),this.direction.copy(i),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,i){return i.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ga)),this}closestPointToPoint(e,i){i.subVectors(e,this.origin);const r=i.dot(this.direction);return r<0?i.copy(this.origin):i.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const i=ga.subVectors(e,this.origin).dot(this.direction);return i<0?this.origin.distanceToSquared(e):(ga.copy(this.origin).addScaledVector(this.direction,i),ga.distanceToSquared(e))}distanceSqToSegment(e,i,r,u){md.copy(e).add(i).multiplyScalar(.5),Ku.copy(i).sub(e).normalize(),ts.copy(this.origin).sub(md);const f=e.distanceTo(i)*.5,h=-this.direction.dot(Ku),d=ts.dot(this.direction),g=-ts.dot(Ku),_=ts.lengthSq(),S=Math.abs(1-h*h);let m,y,M,A;if(S>0)if(m=h*g-d,y=h*d-g,A=f*S,m>=0)if(y>=-A)if(y<=A){const R=1/S;m*=R,y*=R,M=m*(m+h*y+2*d)+y*(h*m+y+2*g)+_}else y=f,m=Math.max(0,-(h*y+d)),M=-m*m+y*(y+2*g)+_;else y=-f,m=Math.max(0,-(h*y+d)),M=-m*m+y*(y+2*g)+_;else y<=-A?(m=Math.max(0,-(-h*f+d)),y=m>0?-f:Math.min(Math.max(-f,-g),f),M=-m*m+y*(y+2*g)+_):y<=A?(m=0,y=Math.min(Math.max(-f,-g),f),M=y*(y+2*g)+_):(m=Math.max(0,-(h*f+d)),y=m>0?f:Math.min(Math.max(-f,-g),f),M=-m*m+y*(y+2*g)+_);else y=h>0?-f:f,m=Math.max(0,-(h*y+d)),M=-m*m+y*(y+2*g)+_;return r&&r.copy(this.origin).addScaledVector(this.direction,m),u&&u.copy(md).addScaledVector(Ku,y),M}intersectSphere(e,i){ga.subVectors(e.center,this.origin);const r=ga.dot(this.direction),u=ga.dot(ga)-r*r,f=e.radius*e.radius;if(u>f)return null;const h=Math.sqrt(f-u),d=r-h,g=r+h;return g<0?null:d<0?this.at(g,i):this.at(d,i)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const i=e.normal.dot(this.direction);if(i===0)return e.distanceToPoint(this.origin)===0?0:null;const r=-(this.origin.dot(e.normal)+e.constant)/i;return r>=0?r:null}intersectPlane(e,i){const r=this.distanceToPlane(e);return r===null?null:this.at(r,i)}intersectsPlane(e){const i=e.distanceToPoint(this.origin);return i===0||e.normal.dot(this.direction)*i<0}intersectBox(e,i){let r,u,f,h,d,g;const _=1/this.direction.x,S=1/this.direction.y,m=1/this.direction.z,y=this.origin;return _>=0?(r=(e.min.x-y.x)*_,u=(e.max.x-y.x)*_):(r=(e.max.x-y.x)*_,u=(e.min.x-y.x)*_),S>=0?(f=(e.min.y-y.y)*S,h=(e.max.y-y.y)*S):(f=(e.max.y-y.y)*S,h=(e.min.y-y.y)*S),r>h||f>u||((f>r||isNaN(r))&&(r=f),(h<u||isNaN(u))&&(u=h),m>=0?(d=(e.min.z-y.z)*m,g=(e.max.z-y.z)*m):(d=(e.max.z-y.z)*m,g=(e.min.z-y.z)*m),r>g||d>u)||((d>r||r!==r)&&(r=d),(g<u||u!==u)&&(u=g),u<0)?null:this.at(r>=0?r:u,i)}intersectsBox(e){return this.intersectBox(e,ga)!==null}intersectTriangle(e,i,r,u,f){_d.subVectors(i,e),Qu.subVectors(r,e),gd.crossVectors(_d,Qu);let h=this.direction.dot(gd),d;if(h>0){if(u)return null;d=1}else if(h<0)d=-1,h=-h;else return null;ts.subVectors(this.origin,e);const g=d*this.direction.dot(Qu.crossVectors(ts,Qu));if(g<0)return null;const _=d*this.direction.dot(_d.cross(ts));if(_<0||g+_>h)return null;const S=-d*ts.dot(gd);return S<0?null:this.at(S/h,f)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ke{constructor(e,i,r,u,f,h,d,g,_,S,m,y,M,A,R,x){Ke.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,i,r,u,f,h,d,g,_,S,m,y,M,A,R,x)}set(e,i,r,u,f,h,d,g,_,S,m,y,M,A,R,x){const v=this.elements;return v[0]=e,v[4]=i,v[8]=r,v[12]=u,v[1]=f,v[5]=h,v[9]=d,v[13]=g,v[2]=_,v[6]=S,v[10]=m,v[14]=y,v[3]=M,v[7]=A,v[11]=R,v[15]=x,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ke().fromArray(this.elements)}copy(e){const i=this.elements,r=e.elements;return i[0]=r[0],i[1]=r[1],i[2]=r[2],i[3]=r[3],i[4]=r[4],i[5]=r[5],i[6]=r[6],i[7]=r[7],i[8]=r[8],i[9]=r[9],i[10]=r[10],i[11]=r[11],i[12]=r[12],i[13]=r[13],i[14]=r[14],i[15]=r[15],this}copyPosition(e){const i=this.elements,r=e.elements;return i[12]=r[12],i[13]=r[13],i[14]=r[14],this}setFromMatrix3(e){const i=e.elements;return this.set(i[0],i[3],i[6],0,i[1],i[4],i[7],0,i[2],i[5],i[8],0,0,0,0,1),this}extractBasis(e,i,r){return e.setFromMatrixColumn(this,0),i.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this}makeBasis(e,i,r){return this.set(e.x,i.x,r.x,0,e.y,i.y,r.y,0,e.z,i.z,r.z,0,0,0,0,1),this}extractRotation(e){const i=this.elements,r=e.elements,u=1/Vr.setFromMatrixColumn(e,0).length(),f=1/Vr.setFromMatrixColumn(e,1).length(),h=1/Vr.setFromMatrixColumn(e,2).length();return i[0]=r[0]*u,i[1]=r[1]*u,i[2]=r[2]*u,i[3]=0,i[4]=r[4]*f,i[5]=r[5]*f,i[6]=r[6]*f,i[7]=0,i[8]=r[8]*h,i[9]=r[9]*h,i[10]=r[10]*h,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromEuler(e){const i=this.elements,r=e.x,u=e.y,f=e.z,h=Math.cos(r),d=Math.sin(r),g=Math.cos(u),_=Math.sin(u),S=Math.cos(f),m=Math.sin(f);if(e.order==="XYZ"){const y=h*S,M=h*m,A=d*S,R=d*m;i[0]=g*S,i[4]=-g*m,i[8]=_,i[1]=M+A*_,i[5]=y-R*_,i[9]=-d*g,i[2]=R-y*_,i[6]=A+M*_,i[10]=h*g}else if(e.order==="YXZ"){const y=g*S,M=g*m,A=_*S,R=_*m;i[0]=y+R*d,i[4]=A*d-M,i[8]=h*_,i[1]=h*m,i[5]=h*S,i[9]=-d,i[2]=M*d-A,i[6]=R+y*d,i[10]=h*g}else if(e.order==="ZXY"){const y=g*S,M=g*m,A=_*S,R=_*m;i[0]=y-R*d,i[4]=-h*m,i[8]=A+M*d,i[1]=M+A*d,i[5]=h*S,i[9]=R-y*d,i[2]=-h*_,i[6]=d,i[10]=h*g}else if(e.order==="ZYX"){const y=h*S,M=h*m,A=d*S,R=d*m;i[0]=g*S,i[4]=A*_-M,i[8]=y*_+R,i[1]=g*m,i[5]=R*_+y,i[9]=M*_-A,i[2]=-_,i[6]=d*g,i[10]=h*g}else if(e.order==="YZX"){const y=h*g,M=h*_,A=d*g,R=d*_;i[0]=g*S,i[4]=R-y*m,i[8]=A*m+M,i[1]=m,i[5]=h*S,i[9]=-d*S,i[2]=-_*S,i[6]=M*m+A,i[10]=y-R*m}else if(e.order==="XZY"){const y=h*g,M=h*_,A=d*g,R=d*_;i[0]=g*S,i[4]=-m,i[8]=_*S,i[1]=y*m+R,i[5]=h*S,i[9]=M*m-A,i[2]=A*m-M,i[6]=d*S,i[10]=R*m+y}return i[3]=0,i[7]=0,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromQuaternion(e){return this.compose(WE,e,jE)}lookAt(e,i,r){const u=this.elements;return ri.subVectors(e,i),ri.lengthSq()===0&&(ri.z=1),ri.normalize(),es.crossVectors(r,ri),es.lengthSq()===0&&(Math.abs(r.z)===1?ri.x+=1e-4:ri.z+=1e-4,ri.normalize(),es.crossVectors(r,ri)),es.normalize(),Ju.crossVectors(ri,es),u[0]=es.x,u[4]=Ju.x,u[8]=ri.x,u[1]=es.y,u[5]=Ju.y,u[9]=ri.y,u[2]=es.z,u[6]=Ju.z,u[10]=ri.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,i){const r=e.elements,u=i.elements,f=this.elements,h=r[0],d=r[4],g=r[8],_=r[12],S=r[1],m=r[5],y=r[9],M=r[13],A=r[2],R=r[6],x=r[10],v=r[14],z=r[3],P=r[7],D=r[11],H=r[15],B=u[0],O=u[4],k=u[8],w=u[12],C=u[1],V=u[5],at=u[9],ut=u[13],_t=u[2],lt=u[6],W=u[10],st=u[14],Z=u[3],gt=u[7],St=u[11],Ht=u[15];return f[0]=h*B+d*C+g*_t+_*Z,f[4]=h*O+d*V+g*lt+_*gt,f[8]=h*k+d*at+g*W+_*St,f[12]=h*w+d*ut+g*st+_*Ht,f[1]=S*B+m*C+y*_t+M*Z,f[5]=S*O+m*V+y*lt+M*gt,f[9]=S*k+m*at+y*W+M*St,f[13]=S*w+m*ut+y*st+M*Ht,f[2]=A*B+R*C+x*_t+v*Z,f[6]=A*O+R*V+x*lt+v*gt,f[10]=A*k+R*at+x*W+v*St,f[14]=A*w+R*ut+x*st+v*Ht,f[3]=z*B+P*C+D*_t+H*Z,f[7]=z*O+P*V+D*lt+H*gt,f[11]=z*k+P*at+D*W+H*St,f[15]=z*w+P*ut+D*st+H*Ht,this}multiplyScalar(e){const i=this.elements;return i[0]*=e,i[4]*=e,i[8]*=e,i[12]*=e,i[1]*=e,i[5]*=e,i[9]*=e,i[13]*=e,i[2]*=e,i[6]*=e,i[10]*=e,i[14]*=e,i[3]*=e,i[7]*=e,i[11]*=e,i[15]*=e,this}determinant(){const e=this.elements,i=e[0],r=e[4],u=e[8],f=e[12],h=e[1],d=e[5],g=e[9],_=e[13],S=e[2],m=e[6],y=e[10],M=e[14],A=e[3],R=e[7],x=e[11],v=e[15];return A*(+f*g*m-u*_*m-f*d*y+r*_*y+u*d*M-r*g*M)+R*(+i*g*M-i*_*y+f*h*y-u*h*M+u*_*S-f*g*S)+x*(+i*_*m-i*d*M-f*h*m+r*h*M+f*d*S-r*_*S)+v*(-u*d*S-i*g*m+i*d*y+u*h*m-r*h*y+r*g*S)}transpose(){const e=this.elements;let i;return i=e[1],e[1]=e[4],e[4]=i,i=e[2],e[2]=e[8],e[8]=i,i=e[6],e[6]=e[9],e[9]=i,i=e[3],e[3]=e[12],e[12]=i,i=e[7],e[7]=e[13],e[13]=i,i=e[11],e[11]=e[14],e[14]=i,this}setPosition(e,i,r){const u=this.elements;return e.isVector3?(u[12]=e.x,u[13]=e.y,u[14]=e.z):(u[12]=e,u[13]=i,u[14]=r),this}invert(){const e=this.elements,i=e[0],r=e[1],u=e[2],f=e[3],h=e[4],d=e[5],g=e[6],_=e[7],S=e[8],m=e[9],y=e[10],M=e[11],A=e[12],R=e[13],x=e[14],v=e[15],z=m*x*_-R*y*_+R*g*M-d*x*M-m*g*v+d*y*v,P=A*y*_-S*x*_-A*g*M+h*x*M+S*g*v-h*y*v,D=S*R*_-A*m*_+A*d*M-h*R*M-S*d*v+h*m*v,H=A*m*g-S*R*g-A*d*y+h*R*y+S*d*x-h*m*x,B=i*z+r*P+u*D+f*H;if(B===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const O=1/B;return e[0]=z*O,e[1]=(R*y*f-m*x*f-R*u*M+r*x*M+m*u*v-r*y*v)*O,e[2]=(d*x*f-R*g*f+R*u*_-r*x*_-d*u*v+r*g*v)*O,e[3]=(m*g*f-d*y*f-m*u*_+r*y*_+d*u*M-r*g*M)*O,e[4]=P*O,e[5]=(S*x*f-A*y*f+A*u*M-i*x*M-S*u*v+i*y*v)*O,e[6]=(A*g*f-h*x*f-A*u*_+i*x*_+h*u*v-i*g*v)*O,e[7]=(h*y*f-S*g*f+S*u*_-i*y*_-h*u*M+i*g*M)*O,e[8]=D*O,e[9]=(A*m*f-S*R*f-A*r*M+i*R*M+S*r*v-i*m*v)*O,e[10]=(h*R*f-A*d*f+A*r*_-i*R*_-h*r*v+i*d*v)*O,e[11]=(S*d*f-h*m*f-S*r*_+i*m*_+h*r*M-i*d*M)*O,e[12]=H*O,e[13]=(S*R*u-A*m*u+A*r*y-i*R*y-S*r*x+i*m*x)*O,e[14]=(A*d*u-h*R*u-A*r*g+i*R*g+h*r*x-i*d*x)*O,e[15]=(h*m*u-S*d*u+S*r*g-i*m*g-h*r*y+i*d*y)*O,this}scale(e){const i=this.elements,r=e.x,u=e.y,f=e.z;return i[0]*=r,i[4]*=u,i[8]*=f,i[1]*=r,i[5]*=u,i[9]*=f,i[2]*=r,i[6]*=u,i[10]*=f,i[3]*=r,i[7]*=u,i[11]*=f,this}getMaxScaleOnAxis(){const e=this.elements,i=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],r=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],u=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(i,r,u))}makeTranslation(e,i,r){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,i,0,0,1,r,0,0,0,1),this}makeRotationX(e){const i=Math.cos(e),r=Math.sin(e);return this.set(1,0,0,0,0,i,-r,0,0,r,i,0,0,0,0,1),this}makeRotationY(e){const i=Math.cos(e),r=Math.sin(e);return this.set(i,0,r,0,0,1,0,0,-r,0,i,0,0,0,0,1),this}makeRotationZ(e){const i=Math.cos(e),r=Math.sin(e);return this.set(i,-r,0,0,r,i,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,i){const r=Math.cos(i),u=Math.sin(i),f=1-r,h=e.x,d=e.y,g=e.z,_=f*h,S=f*d;return this.set(_*h+r,_*d-u*g,_*g+u*d,0,_*d+u*g,S*d+r,S*g-u*h,0,_*g-u*d,S*g+u*h,f*g*g+r,0,0,0,0,1),this}makeScale(e,i,r){return this.set(e,0,0,0,0,i,0,0,0,0,r,0,0,0,0,1),this}makeShear(e,i,r,u,f,h){return this.set(1,r,f,0,e,1,h,0,i,u,1,0,0,0,0,1),this}compose(e,i,r){const u=this.elements,f=i._x,h=i._y,d=i._z,g=i._w,_=f+f,S=h+h,m=d+d,y=f*_,M=f*S,A=f*m,R=h*S,x=h*m,v=d*m,z=g*_,P=g*S,D=g*m,H=r.x,B=r.y,O=r.z;return u[0]=(1-(R+v))*H,u[1]=(M+D)*H,u[2]=(A-P)*H,u[3]=0,u[4]=(M-D)*B,u[5]=(1-(y+v))*B,u[6]=(x+z)*B,u[7]=0,u[8]=(A+P)*O,u[9]=(x-z)*O,u[10]=(1-(y+R))*O,u[11]=0,u[12]=e.x,u[13]=e.y,u[14]=e.z,u[15]=1,this}decompose(e,i,r){const u=this.elements;let f=Vr.set(u[0],u[1],u[2]).length();const h=Vr.set(u[4],u[5],u[6]).length(),d=Vr.set(u[8],u[9],u[10]).length();this.determinant()<0&&(f=-f),e.x=u[12],e.y=u[13],e.z=u[14],Di.copy(this);const _=1/f,S=1/h,m=1/d;return Di.elements[0]*=_,Di.elements[1]*=_,Di.elements[2]*=_,Di.elements[4]*=S,Di.elements[5]*=S,Di.elements[6]*=S,Di.elements[8]*=m,Di.elements[9]*=m,Di.elements[10]*=m,i.setFromRotationMatrix(Di),r.x=f,r.y=h,r.z=d,this}makePerspective(e,i,r,u,f,h,d=Ki,g=!1){const _=this.elements,S=2*f/(i-e),m=2*f/(r-u),y=(i+e)/(i-e),M=(r+u)/(r-u);let A,R;if(g)A=f/(h-f),R=h*f/(h-f);else if(d===Ki)A=-(h+f)/(h-f),R=-2*h*f/(h-f);else if(d===Ec)A=-h/(h-f),R=-h*f/(h-f);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+d);return _[0]=S,_[4]=0,_[8]=y,_[12]=0,_[1]=0,_[5]=m,_[9]=M,_[13]=0,_[2]=0,_[6]=0,_[10]=A,_[14]=R,_[3]=0,_[7]=0,_[11]=-1,_[15]=0,this}makeOrthographic(e,i,r,u,f,h,d=Ki,g=!1){const _=this.elements,S=2/(i-e),m=2/(r-u),y=-(i+e)/(i-e),M=-(r+u)/(r-u);let A,R;if(g)A=1/(h-f),R=h/(h-f);else if(d===Ki)A=-2/(h-f),R=-(h+f)/(h-f);else if(d===Ec)A=-1/(h-f),R=-f/(h-f);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+d);return _[0]=S,_[4]=0,_[8]=0,_[12]=y,_[1]=0,_[5]=m,_[9]=0,_[13]=M,_[2]=0,_[6]=0,_[10]=A,_[14]=R,_[3]=0,_[7]=0,_[11]=0,_[15]=1,this}equals(e){const i=this.elements,r=e.elements;for(let u=0;u<16;u++)if(i[u]!==r[u])return!1;return!0}fromArray(e,i=0){for(let r=0;r<16;r++)this.elements[r]=e[r+i];return this}toArray(e=[],i=0){const r=this.elements;return e[i]=r[0],e[i+1]=r[1],e[i+2]=r[2],e[i+3]=r[3],e[i+4]=r[4],e[i+5]=r[5],e[i+6]=r[6],e[i+7]=r[7],e[i+8]=r[8],e[i+9]=r[9],e[i+10]=r[10],e[i+11]=r[11],e[i+12]=r[12],e[i+13]=r[13],e[i+14]=r[14],e[i+15]=r[15],e}}const Vr=new nt,Di=new Ke,WE=new nt(0,0,0),jE=new nt(1,1,1),es=new nt,Ju=new nt,ri=new nt,yv=new Ke,xv=new Ws;class $i{constructor(e=0,i=0,r=0,u=$i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=i,this._z=r,this._order=u}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,i,r,u=this._order){return this._x=e,this._y=i,this._z=r,this._order=u,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,i=this._order,r=!0){const u=e.elements,f=u[0],h=u[4],d=u[8],g=u[1],_=u[5],S=u[9],m=u[2],y=u[6],M=u[10];switch(i){case"XYZ":this._y=Math.asin(ve(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-S,M),this._z=Math.atan2(-h,f)):(this._x=Math.atan2(y,_),this._z=0);break;case"YXZ":this._x=Math.asin(-ve(S,-1,1)),Math.abs(S)<.9999999?(this._y=Math.atan2(d,M),this._z=Math.atan2(g,_)):(this._y=Math.atan2(-m,f),this._z=0);break;case"ZXY":this._x=Math.asin(ve(y,-1,1)),Math.abs(y)<.9999999?(this._y=Math.atan2(-m,M),this._z=Math.atan2(-h,_)):(this._y=0,this._z=Math.atan2(g,f));break;case"ZYX":this._y=Math.asin(-ve(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(y,M),this._z=Math.atan2(g,f)):(this._x=0,this._z=Math.atan2(-h,_));break;case"YZX":this._z=Math.asin(ve(g,-1,1)),Math.abs(g)<.9999999?(this._x=Math.atan2(-S,_),this._y=Math.atan2(-m,f)):(this._x=0,this._y=Math.atan2(d,M));break;case"XZY":this._z=Math.asin(-ve(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(y,_),this._y=Math.atan2(d,f)):(this._x=Math.atan2(-S,M),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+i)}return this._order=i,r===!0&&this._onChangeCallback(),this}setFromQuaternion(e,i,r){return yv.makeRotationFromQuaternion(e),this.setFromRotationMatrix(yv,i,r)}setFromVector3(e,i=this._order){return this.set(e.x,e.y,e.z,i)}reorder(e){return xv.setFromEuler(this),this.setFromQuaternion(xv,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],i=0){return e[i]=this._x,e[i+1]=this._y,e[i+2]=this._z,e[i+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}$i.DEFAULT_ORDER="XYZ";class Vp{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let ZE=0;const Mv=new nt,Xr=new Ws,va=new Ke,$u=new nt,rl=new nt,KE=new nt,QE=new Ws,Ev=new nt(1,0,0),Tv=new nt(0,1,0),bv=new nt(0,0,1),Av={type:"added"},JE={type:"removed"},kr={type:"childadded",child:null},vd={type:"childremoved",child:null};class Dn extends Zs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ZE++}),this.uuid=uo(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Dn.DEFAULT_UP.clone();const e=new nt,i=new $i,r=new Ws,u=new nt(1,1,1);function f(){r.setFromEuler(i,!1)}function h(){i.setFromQuaternion(r,void 0,!1)}i._onChange(f),r._onChange(h),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:i},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:u},modelViewMatrix:{value:new Ke},normalMatrix:{value:new de}}),this.matrix=new Ke,this.matrixWorld=new Ke,this.matrixAutoUpdate=Dn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Dn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Vp,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,i){this.quaternion.setFromAxisAngle(e,i)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,i){return Xr.setFromAxisAngle(e,i),this.quaternion.multiply(Xr),this}rotateOnWorldAxis(e,i){return Xr.setFromAxisAngle(e,i),this.quaternion.premultiply(Xr),this}rotateX(e){return this.rotateOnAxis(Ev,e)}rotateY(e){return this.rotateOnAxis(Tv,e)}rotateZ(e){return this.rotateOnAxis(bv,e)}translateOnAxis(e,i){return Mv.copy(e).applyQuaternion(this.quaternion),this.position.add(Mv.multiplyScalar(i)),this}translateX(e){return this.translateOnAxis(Ev,e)}translateY(e){return this.translateOnAxis(Tv,e)}translateZ(e){return this.translateOnAxis(bv,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(va.copy(this.matrixWorld).invert())}lookAt(e,i,r){e.isVector3?$u.copy(e):$u.set(e,i,r);const u=this.parent;this.updateWorldMatrix(!0,!1),rl.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?va.lookAt(rl,$u,this.up):va.lookAt($u,rl,this.up),this.quaternion.setFromRotationMatrix(va),u&&(va.extractRotation(u.matrixWorld),Xr.setFromRotationMatrix(va),this.quaternion.premultiply(Xr.invert()))}add(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.add(arguments[i]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Av),kr.child=e,this.dispatchEvent(kr),kr.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}const i=this.children.indexOf(e);return i!==-1&&(e.parent=null,this.children.splice(i,1),e.dispatchEvent(JE),vd.child=e,this.dispatchEvent(vd),vd.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),va.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),va.multiply(e.parent.matrixWorld)),e.applyMatrix4(va),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Av),kr.child=e,this.dispatchEvent(kr),kr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,i){if(this[e]===i)return this;for(let r=0,u=this.children.length;r<u;r++){const h=this.children[r].getObjectByProperty(e,i);if(h!==void 0)return h}}getObjectsByProperty(e,i,r=[]){this[e]===i&&r.push(this);const u=this.children;for(let f=0,h=u.length;f<h;f++)u[f].getObjectsByProperty(e,i,r);return r}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(rl,e,KE),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(rl,QE,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const i=this.matrixWorld.elements;return e.set(i[8],i[9],i[10]).normalize()}raycast(){}traverse(e){e(this);const i=this.children;for(let r=0,u=i.length;r<u;r++)i[r].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const i=this.children;for(let r=0,u=i.length;r<u;r++)i[r].traverseVisible(e)}traverseAncestors(e){const i=this.parent;i!==null&&(e(i),i.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const i=this.children;for(let r=0,u=i.length;r<u;r++)i[r].updateMatrixWorld(e)}updateWorldMatrix(e,i){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),i===!0){const u=this.children;for(let f=0,h=u.length;f<h;f++)u[f].updateWorldMatrix(!1,!0)}}toJSON(e){const i=e===void 0||typeof e=="string",r={};i&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const u={};u.uuid=this.uuid,u.type=this.type,this.name!==""&&(u.name=this.name),this.castShadow===!0&&(u.castShadow=!0),this.receiveShadow===!0&&(u.receiveShadow=!0),this.visible===!1&&(u.visible=!1),this.frustumCulled===!1&&(u.frustumCulled=!1),this.renderOrder!==0&&(u.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(u.userData=this.userData),u.layers=this.layers.mask,u.matrix=this.matrix.toArray(),u.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(u.matrixAutoUpdate=!1),this.isInstancedMesh&&(u.type="InstancedMesh",u.count=this.count,u.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(u.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(u.type="BatchedMesh",u.perObjectFrustumCulled=this.perObjectFrustumCulled,u.sortObjects=this.sortObjects,u.drawRanges=this._drawRanges,u.reservedRanges=this._reservedRanges,u.geometryInfo=this._geometryInfo.map(d=>({...d,boundingBox:d.boundingBox?d.boundingBox.toJSON():void 0,boundingSphere:d.boundingSphere?d.boundingSphere.toJSON():void 0})),u.instanceInfo=this._instanceInfo.map(d=>({...d})),u.availableInstanceIds=this._availableInstanceIds.slice(),u.availableGeometryIds=this._availableGeometryIds.slice(),u.nextIndexStart=this._nextIndexStart,u.nextVertexStart=this._nextVertexStart,u.geometryCount=this._geometryCount,u.maxInstanceCount=this._maxInstanceCount,u.maxVertexCount=this._maxVertexCount,u.maxIndexCount=this._maxIndexCount,u.geometryInitialized=this._geometryInitialized,u.matricesTexture=this._matricesTexture.toJSON(e),u.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(u.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(u.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(u.boundingBox=this.boundingBox.toJSON()));function f(d,g){return d[g.uuid]===void 0&&(d[g.uuid]=g.toJSON(e)),g.uuid}if(this.isScene)this.background&&(this.background.isColor?u.background=this.background.toJSON():this.background.isTexture&&(u.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(u.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){u.geometry=f(e.geometries,this.geometry);const d=this.geometry.parameters;if(d!==void 0&&d.shapes!==void 0){const g=d.shapes;if(Array.isArray(g))for(let _=0,S=g.length;_<S;_++){const m=g[_];f(e.shapes,m)}else f(e.shapes,g)}}if(this.isSkinnedMesh&&(u.bindMode=this.bindMode,u.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(f(e.skeletons,this.skeleton),u.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const d=[];for(let g=0,_=this.material.length;g<_;g++)d.push(f(e.materials,this.material[g]));u.material=d}else u.material=f(e.materials,this.material);if(this.children.length>0){u.children=[];for(let d=0;d<this.children.length;d++)u.children.push(this.children[d].toJSON(e).object)}if(this.animations.length>0){u.animations=[];for(let d=0;d<this.animations.length;d++){const g=this.animations[d];u.animations.push(f(e.animations,g))}}if(i){const d=h(e.geometries),g=h(e.materials),_=h(e.textures),S=h(e.images),m=h(e.shapes),y=h(e.skeletons),M=h(e.animations),A=h(e.nodes);d.length>0&&(r.geometries=d),g.length>0&&(r.materials=g),_.length>0&&(r.textures=_),S.length>0&&(r.images=S),m.length>0&&(r.shapes=m),y.length>0&&(r.skeletons=y),M.length>0&&(r.animations=M),A.length>0&&(r.nodes=A)}return r.object=u,r;function h(d){const g=[];for(const _ in d){const S=d[_];delete S.metadata,g.push(S)}return g}}clone(e){return new this.constructor().copy(this,e)}copy(e,i=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),i===!0)for(let r=0;r<e.children.length;r++){const u=e.children[r];this.add(u.clone())}return this}}Dn.DEFAULT_UP=new nt(0,1,0);Dn.DEFAULT_MATRIX_AUTO_UPDATE=!0;Dn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ui=new nt,Sa=new nt,Sd=new nt,ya=new nt,Yr=new nt,qr=new nt,Rv=new nt,yd=new nt,xd=new nt,Md=new nt,Ed=new sn,Td=new sn,bd=new sn;class Ni{constructor(e=new nt,i=new nt,r=new nt){this.a=e,this.b=i,this.c=r}static getNormal(e,i,r,u){u.subVectors(r,i),Ui.subVectors(e,i),u.cross(Ui);const f=u.lengthSq();return f>0?u.multiplyScalar(1/Math.sqrt(f)):u.set(0,0,0)}static getBarycoord(e,i,r,u,f){Ui.subVectors(u,i),Sa.subVectors(r,i),Sd.subVectors(e,i);const h=Ui.dot(Ui),d=Ui.dot(Sa),g=Ui.dot(Sd),_=Sa.dot(Sa),S=Sa.dot(Sd),m=h*_-d*d;if(m===0)return f.set(0,0,0),null;const y=1/m,M=(_*g-d*S)*y,A=(h*S-d*g)*y;return f.set(1-M-A,A,M)}static containsPoint(e,i,r,u){return this.getBarycoord(e,i,r,u,ya)===null?!1:ya.x>=0&&ya.y>=0&&ya.x+ya.y<=1}static getInterpolation(e,i,r,u,f,h,d,g){return this.getBarycoord(e,i,r,u,ya)===null?(g.x=0,g.y=0,"z"in g&&(g.z=0),"w"in g&&(g.w=0),null):(g.setScalar(0),g.addScaledVector(f,ya.x),g.addScaledVector(h,ya.y),g.addScaledVector(d,ya.z),g)}static getInterpolatedAttribute(e,i,r,u,f,h){return Ed.setScalar(0),Td.setScalar(0),bd.setScalar(0),Ed.fromBufferAttribute(e,i),Td.fromBufferAttribute(e,r),bd.fromBufferAttribute(e,u),h.setScalar(0),h.addScaledVector(Ed,f.x),h.addScaledVector(Td,f.y),h.addScaledVector(bd,f.z),h}static isFrontFacing(e,i,r,u){return Ui.subVectors(r,i),Sa.subVectors(e,i),Ui.cross(Sa).dot(u)<0}set(e,i,r){return this.a.copy(e),this.b.copy(i),this.c.copy(r),this}setFromPointsAndIndices(e,i,r,u){return this.a.copy(e[i]),this.b.copy(e[r]),this.c.copy(e[u]),this}setFromAttributeAndIndices(e,i,r,u){return this.a.fromBufferAttribute(e,i),this.b.fromBufferAttribute(e,r),this.c.fromBufferAttribute(e,u),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ui.subVectors(this.c,this.b),Sa.subVectors(this.a,this.b),Ui.cross(Sa).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Ni.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,i){return Ni.getBarycoord(e,this.a,this.b,this.c,i)}getInterpolation(e,i,r,u,f){return Ni.getInterpolation(e,this.a,this.b,this.c,i,r,u,f)}containsPoint(e){return Ni.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Ni.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,i){const r=this.a,u=this.b,f=this.c;let h,d;Yr.subVectors(u,r),qr.subVectors(f,r),yd.subVectors(e,r);const g=Yr.dot(yd),_=qr.dot(yd);if(g<=0&&_<=0)return i.copy(r);xd.subVectors(e,u);const S=Yr.dot(xd),m=qr.dot(xd);if(S>=0&&m<=S)return i.copy(u);const y=g*m-S*_;if(y<=0&&g>=0&&S<=0)return h=g/(g-S),i.copy(r).addScaledVector(Yr,h);Md.subVectors(e,f);const M=Yr.dot(Md),A=qr.dot(Md);if(A>=0&&M<=A)return i.copy(f);const R=M*_-g*A;if(R<=0&&_>=0&&A<=0)return d=_/(_-A),i.copy(r).addScaledVector(qr,d);const x=S*A-M*m;if(x<=0&&m-S>=0&&M-A>=0)return Rv.subVectors(f,u),d=(m-S)/(m-S+(M-A)),i.copy(u).addScaledVector(Rv,d);const v=1/(x+R+y);return h=R*v,d=y*v,i.copy(r).addScaledVector(Yr,h).addScaledVector(qr,d)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const CS={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ns={h:0,s:0,l:0},tc={h:0,s:0,l:0};function Ad(o,e,i){return i<0&&(i+=1),i>1&&(i-=1),i<1/6?o+(e-o)*6*i:i<1/2?e:i<2/3?o+(e-o)*6*(2/3-i):o}class De{constructor(e,i,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,i,r)}set(e,i,r){if(i===void 0&&r===void 0){const u=e;u&&u.isColor?this.copy(u):typeof u=="number"?this.setHex(u):typeof u=="string"&&this.setStyle(u)}else this.setRGB(e,i,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,i=li){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,we.colorSpaceToWorking(this,i),this}setRGB(e,i,r,u=we.workingColorSpace){return this.r=e,this.g=i,this.b=r,we.colorSpaceToWorking(this,u),this}setHSL(e,i,r,u=we.workingColorSpace){if(e=Fp(e,1),i=ve(i,0,1),r=ve(r,0,1),i===0)this.r=this.g=this.b=r;else{const f=r<=.5?r*(1+i):r+i-r*i,h=2*r-f;this.r=Ad(h,f,e+1/3),this.g=Ad(h,f,e),this.b=Ad(h,f,e-1/3)}return we.colorSpaceToWorking(this,u),this}setStyle(e,i=li){function r(f){f!==void 0&&parseFloat(f)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let u;if(u=/^(\w+)\(([^\)]*)\)/.exec(e)){let f;const h=u[1],d=u[2];switch(h){case"rgb":case"rgba":if(f=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(f[4]),this.setRGB(Math.min(255,parseInt(f[1],10))/255,Math.min(255,parseInt(f[2],10))/255,Math.min(255,parseInt(f[3],10))/255,i);if(f=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(f[4]),this.setRGB(Math.min(100,parseInt(f[1],10))/100,Math.min(100,parseInt(f[2],10))/100,Math.min(100,parseInt(f[3],10))/100,i);break;case"hsl":case"hsla":if(f=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(f[4]),this.setHSL(parseFloat(f[1])/360,parseFloat(f[2])/100,parseFloat(f[3])/100,i);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(u=/^\#([A-Fa-f\d]+)$/.exec(e)){const f=u[1],h=f.length;if(h===3)return this.setRGB(parseInt(f.charAt(0),16)/15,parseInt(f.charAt(1),16)/15,parseInt(f.charAt(2),16)/15,i);if(h===6)return this.setHex(parseInt(f,16),i);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,i);return this}setColorName(e,i=li){const r=CS[e.toLowerCase()];return r!==void 0?this.setHex(r,i):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ea(e.r),this.g=Ea(e.g),this.b=Ea(e.b),this}copyLinearToSRGB(e){return this.r=io(e.r),this.g=io(e.g),this.b=io(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=li){return we.workingToColorSpace(Pn.copy(this),e),Math.round(ve(Pn.r*255,0,255))*65536+Math.round(ve(Pn.g*255,0,255))*256+Math.round(ve(Pn.b*255,0,255))}getHexString(e=li){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,i=we.workingColorSpace){we.workingToColorSpace(Pn.copy(this),i);const r=Pn.r,u=Pn.g,f=Pn.b,h=Math.max(r,u,f),d=Math.min(r,u,f);let g,_;const S=(d+h)/2;if(d===h)g=0,_=0;else{const m=h-d;switch(_=S<=.5?m/(h+d):m/(2-h-d),h){case r:g=(u-f)/m+(u<f?6:0);break;case u:g=(f-r)/m+2;break;case f:g=(r-u)/m+4;break}g/=6}return e.h=g,e.s=_,e.l=S,e}getRGB(e,i=we.workingColorSpace){return we.workingToColorSpace(Pn.copy(this),i),e.r=Pn.r,e.g=Pn.g,e.b=Pn.b,e}getStyle(e=li){we.workingToColorSpace(Pn.copy(this),e);const i=Pn.r,r=Pn.g,u=Pn.b;return e!==li?`color(${e} ${i.toFixed(3)} ${r.toFixed(3)} ${u.toFixed(3)})`:`rgb(${Math.round(i*255)},${Math.round(r*255)},${Math.round(u*255)})`}offsetHSL(e,i,r){return this.getHSL(ns),this.setHSL(ns.h+e,ns.s+i,ns.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,i){return this.r=e.r+i.r,this.g=e.g+i.g,this.b=e.b+i.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,i){return this.r+=(e.r-this.r)*i,this.g+=(e.g-this.g)*i,this.b+=(e.b-this.b)*i,this}lerpColors(e,i,r){return this.r=e.r+(i.r-e.r)*r,this.g=e.g+(i.g-e.g)*r,this.b=e.b+(i.b-e.b)*r,this}lerpHSL(e,i){this.getHSL(ns),e.getHSL(tc);const r=hl(ns.h,tc.h,i),u=hl(ns.s,tc.s,i),f=hl(ns.l,tc.l,i);return this.setHSL(r,u,f),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const i=this.r,r=this.g,u=this.b,f=e.elements;return this.r=f[0]*i+f[3]*r+f[6]*u,this.g=f[1]*i+f[4]*r+f[7]*u,this.b=f[2]*i+f[5]*r+f[8]*u,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,i=0){return this.r=e[i],this.g=e[i+1],this.b=e[i+2],this}toArray(e=[],i=0){return e[i]=this.r,e[i+1]=this.g,e[i+2]=this.b,e}fromBufferAttribute(e,i){return this.r=e.getX(i),this.g=e.getY(i),this.b=e.getZ(i),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Pn=new De;De.NAMES=CS;let $E=0;class xl extends Zs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:$E++}),this.uuid=uo(),this.name="",this.type="Material",this.blending=no,this.side=ls,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Hd,this.blendDst=Gd,this.blendEquation=Vs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new De(0,0,0),this.blendAlpha=0,this.depthFunc=ao,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=hv,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ir,this.stencilZFail=Ir,this.stencilZPass=Ir,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const i in e){const r=e[i];if(r===void 0){console.warn(`THREE.Material: parameter '${i}' has value of undefined.`);continue}const u=this[i];if(u===void 0){console.warn(`THREE.Material: '${i}' is not a property of THREE.${this.type}.`);continue}u&&u.isColor?u.set(r):u&&u.isVector3&&r&&r.isVector3?u.copy(r):this[i]=r}}toJSON(e){const i=e===void 0||typeof e=="string";i&&(e={textures:{},images:{}});const r={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(r.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(r.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==no&&(r.blending=this.blending),this.side!==ls&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==Hd&&(r.blendSrc=this.blendSrc),this.blendDst!==Gd&&(r.blendDst=this.blendDst),this.blendEquation!==Vs&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==ao&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==hv&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ir&&(r.stencilFail=this.stencilFail),this.stencilZFail!==Ir&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==Ir&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function u(f){const h=[];for(const d in f){const g=f[d];delete g.metadata,h.push(g)}return h}if(i){const f=u(e.textures),h=u(e.images);f.length>0&&(r.textures=f),h.length>0&&(r.images=h)}return r}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const i=e.clippingPlanes;let r=null;if(i!==null){const u=i.length;r=new Array(u);for(let f=0;f!==u;++f)r[f]=i[f].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Xp extends xl{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new De(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $i,this.combine=mS,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const dn=new nt,ec=new ce;let tT=0;class Oi{constructor(e,i,r=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:tT++}),this.name="",this.array=e,this.itemSize=i,this.count=e!==void 0?e.length/i:0,this.normalized=r,this.usage=dv,this.updateRanges=[],this.gpuType=Zi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,i){this.updateRanges.push({start:e,count:i})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,i,r){e*=this.itemSize,r*=i.itemSize;for(let u=0,f=this.itemSize;u<f;u++)this.array[e+u]=i.array[r+u];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let i=0,r=this.count;i<r;i++)ec.fromBufferAttribute(this,i),ec.applyMatrix3(e),this.setXY(i,ec.x,ec.y);else if(this.itemSize===3)for(let i=0,r=this.count;i<r;i++)dn.fromBufferAttribute(this,i),dn.applyMatrix3(e),this.setXYZ(i,dn.x,dn.y,dn.z);return this}applyMatrix4(e){for(let i=0,r=this.count;i<r;i++)dn.fromBufferAttribute(this,i),dn.applyMatrix4(e),this.setXYZ(i,dn.x,dn.y,dn.z);return this}applyNormalMatrix(e){for(let i=0,r=this.count;i<r;i++)dn.fromBufferAttribute(this,i),dn.applyNormalMatrix(e),this.setXYZ(i,dn.x,dn.y,dn.z);return this}transformDirection(e){for(let i=0,r=this.count;i<r;i++)dn.fromBufferAttribute(this,i),dn.transformDirection(e),this.setXYZ(i,dn.x,dn.y,dn.z);return this}set(e,i=0){return this.array.set(e,i),this}getComponent(e,i){let r=this.array[e*this.itemSize+i];return this.normalized&&(r=Jr(r,this.array)),r}setComponent(e,i,r){return this.normalized&&(r=Gn(r,this.array)),this.array[e*this.itemSize+i]=r,this}getX(e){let i=this.array[e*this.itemSize];return this.normalized&&(i=Jr(i,this.array)),i}setX(e,i){return this.normalized&&(i=Gn(i,this.array)),this.array[e*this.itemSize]=i,this}getY(e){let i=this.array[e*this.itemSize+1];return this.normalized&&(i=Jr(i,this.array)),i}setY(e,i){return this.normalized&&(i=Gn(i,this.array)),this.array[e*this.itemSize+1]=i,this}getZ(e){let i=this.array[e*this.itemSize+2];return this.normalized&&(i=Jr(i,this.array)),i}setZ(e,i){return this.normalized&&(i=Gn(i,this.array)),this.array[e*this.itemSize+2]=i,this}getW(e){let i=this.array[e*this.itemSize+3];return this.normalized&&(i=Jr(i,this.array)),i}setW(e,i){return this.normalized&&(i=Gn(i,this.array)),this.array[e*this.itemSize+3]=i,this}setXY(e,i,r){return e*=this.itemSize,this.normalized&&(i=Gn(i,this.array),r=Gn(r,this.array)),this.array[e+0]=i,this.array[e+1]=r,this}setXYZ(e,i,r,u){return e*=this.itemSize,this.normalized&&(i=Gn(i,this.array),r=Gn(r,this.array),u=Gn(u,this.array)),this.array[e+0]=i,this.array[e+1]=r,this.array[e+2]=u,this}setXYZW(e,i,r,u,f){return e*=this.itemSize,this.normalized&&(i=Gn(i,this.array),r=Gn(r,this.array),u=Gn(u,this.array),f=Gn(f,this.array)),this.array[e+0]=i,this.array[e+1]=r,this.array[e+2]=u,this.array[e+3]=f,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==dv&&(e.usage=this.usage),e}}class wS extends Oi{constructor(e,i,r){super(new Uint16Array(e),i,r)}}class DS extends Oi{constructor(e,i,r){super(new Uint32Array(e),i,r)}}class Qi extends Oi{constructor(e,i,r){super(new Float32Array(e),i,r)}}let eT=0;const yi=new Ke,Rd=new Dn,Wr=new nt,oi=new Ks,ol=new Ks,En=new nt;class cs extends Zs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:eT++}),this.uuid=uo(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(AS(e)?DS:wS)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,i){return this.attributes[e]=i,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,i,r=0){this.groups.push({start:e,count:i,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(e,i){this.drawRange.start=e,this.drawRange.count=i}applyMatrix4(e){const i=this.attributes.position;i!==void 0&&(i.applyMatrix4(e),i.needsUpdate=!0);const r=this.attributes.normal;if(r!==void 0){const f=new de().getNormalMatrix(e);r.applyNormalMatrix(f),r.needsUpdate=!0}const u=this.attributes.tangent;return u!==void 0&&(u.transformDirection(e),u.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return yi.makeRotationFromQuaternion(e),this.applyMatrix4(yi),this}rotateX(e){return yi.makeRotationX(e),this.applyMatrix4(yi),this}rotateY(e){return yi.makeRotationY(e),this.applyMatrix4(yi),this}rotateZ(e){return yi.makeRotationZ(e),this.applyMatrix4(yi),this}translate(e,i,r){return yi.makeTranslation(e,i,r),this.applyMatrix4(yi),this}scale(e,i,r){return yi.makeScale(e,i,r),this.applyMatrix4(yi),this}lookAt(e){return Rd.lookAt(e),Rd.updateMatrix(),this.applyMatrix4(Rd.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Wr).negate(),this.translate(Wr.x,Wr.y,Wr.z),this}setFromPoints(e){const i=this.getAttribute("position");if(i===void 0){const r=[];for(let u=0,f=e.length;u<f;u++){const h=e[u];r.push(h.x,h.y,h.z||0)}this.setAttribute("position",new Qi(r,3))}else{const r=Math.min(e.length,i.count);for(let u=0;u<r;u++){const f=e[u];i.setXYZ(u,f.x,f.y,f.z||0)}e.length>i.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),i.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ks);const e=this.attributes.position,i=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new nt(-1/0,-1/0,-1/0),new nt(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),i)for(let r=0,u=i.length;r<u;r++){const f=i[r];oi.setFromBufferAttribute(f),this.morphTargetsRelative?(En.addVectors(this.boundingBox.min,oi.min),this.boundingBox.expandByPoint(En),En.addVectors(this.boundingBox.max,oi.max),this.boundingBox.expandByPoint(En)):(this.boundingBox.expandByPoint(oi.min),this.boundingBox.expandByPoint(oi.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new yl);const e=this.attributes.position,i=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new nt,1/0);return}if(e){const r=this.boundingSphere.center;if(oi.setFromBufferAttribute(e),i)for(let f=0,h=i.length;f<h;f++){const d=i[f];ol.setFromBufferAttribute(d),this.morphTargetsRelative?(En.addVectors(oi.min,ol.min),oi.expandByPoint(En),En.addVectors(oi.max,ol.max),oi.expandByPoint(En)):(oi.expandByPoint(ol.min),oi.expandByPoint(ol.max))}oi.getCenter(r);let u=0;for(let f=0,h=e.count;f<h;f++)En.fromBufferAttribute(e,f),u=Math.max(u,r.distanceToSquared(En));if(i)for(let f=0,h=i.length;f<h;f++){const d=i[f],g=this.morphTargetsRelative;for(let _=0,S=d.count;_<S;_++)En.fromBufferAttribute(d,_),g&&(Wr.fromBufferAttribute(e,_),En.add(Wr)),u=Math.max(u,r.distanceToSquared(En))}this.boundingSphere.radius=Math.sqrt(u),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,i=this.attributes;if(e===null||i.position===void 0||i.normal===void 0||i.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const r=i.position,u=i.normal,f=i.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Oi(new Float32Array(4*r.count),4));const h=this.getAttribute("tangent"),d=[],g=[];for(let k=0;k<r.count;k++)d[k]=new nt,g[k]=new nt;const _=new nt,S=new nt,m=new nt,y=new ce,M=new ce,A=new ce,R=new nt,x=new nt;function v(k,w,C){_.fromBufferAttribute(r,k),S.fromBufferAttribute(r,w),m.fromBufferAttribute(r,C),y.fromBufferAttribute(f,k),M.fromBufferAttribute(f,w),A.fromBufferAttribute(f,C),S.sub(_),m.sub(_),M.sub(y),A.sub(y);const V=1/(M.x*A.y-A.x*M.y);isFinite(V)&&(R.copy(S).multiplyScalar(A.y).addScaledVector(m,-M.y).multiplyScalar(V),x.copy(m).multiplyScalar(M.x).addScaledVector(S,-A.x).multiplyScalar(V),d[k].add(R),d[w].add(R),d[C].add(R),g[k].add(x),g[w].add(x),g[C].add(x))}let z=this.groups;z.length===0&&(z=[{start:0,count:e.count}]);for(let k=0,w=z.length;k<w;++k){const C=z[k],V=C.start,at=C.count;for(let ut=V,_t=V+at;ut<_t;ut+=3)v(e.getX(ut+0),e.getX(ut+1),e.getX(ut+2))}const P=new nt,D=new nt,H=new nt,B=new nt;function O(k){H.fromBufferAttribute(u,k),B.copy(H);const w=d[k];P.copy(w),P.sub(H.multiplyScalar(H.dot(w))).normalize(),D.crossVectors(B,w);const V=D.dot(g[k])<0?-1:1;h.setXYZW(k,P.x,P.y,P.z,V)}for(let k=0,w=z.length;k<w;++k){const C=z[k],V=C.start,at=C.count;for(let ut=V,_t=V+at;ut<_t;ut+=3)O(e.getX(ut+0)),O(e.getX(ut+1)),O(e.getX(ut+2))}}computeVertexNormals(){const e=this.index,i=this.getAttribute("position");if(i!==void 0){let r=this.getAttribute("normal");if(r===void 0)r=new Oi(new Float32Array(i.count*3),3),this.setAttribute("normal",r);else for(let y=0,M=r.count;y<M;y++)r.setXYZ(y,0,0,0);const u=new nt,f=new nt,h=new nt,d=new nt,g=new nt,_=new nt,S=new nt,m=new nt;if(e)for(let y=0,M=e.count;y<M;y+=3){const A=e.getX(y+0),R=e.getX(y+1),x=e.getX(y+2);u.fromBufferAttribute(i,A),f.fromBufferAttribute(i,R),h.fromBufferAttribute(i,x),S.subVectors(h,f),m.subVectors(u,f),S.cross(m),d.fromBufferAttribute(r,A),g.fromBufferAttribute(r,R),_.fromBufferAttribute(r,x),d.add(S),g.add(S),_.add(S),r.setXYZ(A,d.x,d.y,d.z),r.setXYZ(R,g.x,g.y,g.z),r.setXYZ(x,_.x,_.y,_.z)}else for(let y=0,M=i.count;y<M;y+=3)u.fromBufferAttribute(i,y+0),f.fromBufferAttribute(i,y+1),h.fromBufferAttribute(i,y+2),S.subVectors(h,f),m.subVectors(u,f),S.cross(m),r.setXYZ(y+0,S.x,S.y,S.z),r.setXYZ(y+1,S.x,S.y,S.z),r.setXYZ(y+2,S.x,S.y,S.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let i=0,r=e.count;i<r;i++)En.fromBufferAttribute(e,i),En.normalize(),e.setXYZ(i,En.x,En.y,En.z)}toNonIndexed(){function e(d,g){const _=d.array,S=d.itemSize,m=d.normalized,y=new _.constructor(g.length*S);let M=0,A=0;for(let R=0,x=g.length;R<x;R++){d.isInterleavedBufferAttribute?M=g[R]*d.data.stride+d.offset:M=g[R]*S;for(let v=0;v<S;v++)y[A++]=_[M++]}return new Oi(y,S,m)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const i=new cs,r=this.index.array,u=this.attributes;for(const d in u){const g=u[d],_=e(g,r);i.setAttribute(d,_)}const f=this.morphAttributes;for(const d in f){const g=[],_=f[d];for(let S=0,m=_.length;S<m;S++){const y=_[S],M=e(y,r);g.push(M)}i.morphAttributes[d]=g}i.morphTargetsRelative=this.morphTargetsRelative;const h=this.groups;for(let d=0,g=h.length;d<g;d++){const _=h[d];i.addGroup(_.start,_.count,_.materialIndex)}return i}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const g=this.parameters;for(const _ in g)g[_]!==void 0&&(e[_]=g[_]);return e}e.data={attributes:{}};const i=this.index;i!==null&&(e.data.index={type:i.array.constructor.name,array:Array.prototype.slice.call(i.array)});const r=this.attributes;for(const g in r){const _=r[g];e.data.attributes[g]=_.toJSON(e.data)}const u={};let f=!1;for(const g in this.morphAttributes){const _=this.morphAttributes[g],S=[];for(let m=0,y=_.length;m<y;m++){const M=_[m];S.push(M.toJSON(e.data))}S.length>0&&(u[g]=S,f=!0)}f&&(e.data.morphAttributes=u,e.data.morphTargetsRelative=this.morphTargetsRelative);const h=this.groups;h.length>0&&(e.data.groups=JSON.parse(JSON.stringify(h)));const d=this.boundingSphere;return d!==null&&(e.data.boundingSphere=d.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const i={};this.name=e.name;const r=e.index;r!==null&&this.setIndex(r.clone());const u=e.attributes;for(const _ in u){const S=u[_];this.setAttribute(_,S.clone(i))}const f=e.morphAttributes;for(const _ in f){const S=[],m=f[_];for(let y=0,M=m.length;y<M;y++)S.push(m[y].clone(i));this.morphAttributes[_]=S}this.morphTargetsRelative=e.morphTargetsRelative;const h=e.groups;for(let _=0,S=h.length;_<S;_++){const m=h[_];this.addGroup(m.start,m.count,m.materialIndex)}const d=e.boundingBox;d!==null&&(this.boundingBox=d.clone());const g=e.boundingSphere;return g!==null&&(this.boundingSphere=g.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Cv=new Ke,Is=new Gp,nc=new yl,wv=new nt,ic=new nt,ac=new nt,sc=new nt,Cd=new nt,rc=new nt,Dv=new nt,oc=new nt;class Mi extends Dn{constructor(e=new cs,i=new Xp){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=i,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,i){return super.copy(e,i),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const i=this.geometry.morphAttributes,r=Object.keys(i);if(r.length>0){const u=i[r[0]];if(u!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let f=0,h=u.length;f<h;f++){const d=u[f].name||String(f);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=f}}}}getVertexPosition(e,i){const r=this.geometry,u=r.attributes.position,f=r.morphAttributes.position,h=r.morphTargetsRelative;i.fromBufferAttribute(u,e);const d=this.morphTargetInfluences;if(f&&d){rc.set(0,0,0);for(let g=0,_=f.length;g<_;g++){const S=d[g],m=f[g];S!==0&&(Cd.fromBufferAttribute(m,e),h?rc.addScaledVector(Cd,S):rc.addScaledVector(Cd.sub(i),S))}i.add(rc)}return i}raycast(e,i){const r=this.geometry,u=this.material,f=this.matrixWorld;u!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),nc.copy(r.boundingSphere),nc.applyMatrix4(f),Is.copy(e.ray).recast(e.near),!(nc.containsPoint(Is.origin)===!1&&(Is.intersectSphere(nc,wv)===null||Is.origin.distanceToSquared(wv)>(e.far-e.near)**2))&&(Cv.copy(f).invert(),Is.copy(e.ray).applyMatrix4(Cv),!(r.boundingBox!==null&&Is.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,i,Is)))}_computeIntersections(e,i,r){let u;const f=this.geometry,h=this.material,d=f.index,g=f.attributes.position,_=f.attributes.uv,S=f.attributes.uv1,m=f.attributes.normal,y=f.groups,M=f.drawRange;if(d!==null)if(Array.isArray(h))for(let A=0,R=y.length;A<R;A++){const x=y[A],v=h[x.materialIndex],z=Math.max(x.start,M.start),P=Math.min(d.count,Math.min(x.start+x.count,M.start+M.count));for(let D=z,H=P;D<H;D+=3){const B=d.getX(D),O=d.getX(D+1),k=d.getX(D+2);u=lc(this,v,e,r,_,S,m,B,O,k),u&&(u.faceIndex=Math.floor(D/3),u.face.materialIndex=x.materialIndex,i.push(u))}}else{const A=Math.max(0,M.start),R=Math.min(d.count,M.start+M.count);for(let x=A,v=R;x<v;x+=3){const z=d.getX(x),P=d.getX(x+1),D=d.getX(x+2);u=lc(this,h,e,r,_,S,m,z,P,D),u&&(u.faceIndex=Math.floor(x/3),i.push(u))}}else if(g!==void 0)if(Array.isArray(h))for(let A=0,R=y.length;A<R;A++){const x=y[A],v=h[x.materialIndex],z=Math.max(x.start,M.start),P=Math.min(g.count,Math.min(x.start+x.count,M.start+M.count));for(let D=z,H=P;D<H;D+=3){const B=D,O=D+1,k=D+2;u=lc(this,v,e,r,_,S,m,B,O,k),u&&(u.faceIndex=Math.floor(D/3),u.face.materialIndex=x.materialIndex,i.push(u))}}else{const A=Math.max(0,M.start),R=Math.min(g.count,M.start+M.count);for(let x=A,v=R;x<v;x+=3){const z=x,P=x+1,D=x+2;u=lc(this,h,e,r,_,S,m,z,P,D),u&&(u.faceIndex=Math.floor(x/3),i.push(u))}}}}function nT(o,e,i,r,u,f,h,d){let g;if(e.side===Kn?g=r.intersectTriangle(h,f,u,!0,d):g=r.intersectTriangle(u,f,h,e.side===ls,d),g===null)return null;oc.copy(d),oc.applyMatrix4(o.matrixWorld);const _=i.ray.origin.distanceTo(oc);return _<i.near||_>i.far?null:{distance:_,point:oc.clone(),object:o}}function lc(o,e,i,r,u,f,h,d,g,_){o.getVertexPosition(d,ic),o.getVertexPosition(g,ac),o.getVertexPosition(_,sc);const S=nT(o,e,i,r,ic,ac,sc,Dv);if(S){const m=new nt;Ni.getBarycoord(Dv,ic,ac,sc,m),u&&(S.uv=Ni.getInterpolatedAttribute(u,d,g,_,m,new ce)),f&&(S.uv1=Ni.getInterpolatedAttribute(f,d,g,_,m,new ce)),h&&(S.normal=Ni.getInterpolatedAttribute(h,d,g,_,m,new nt),S.normal.dot(r.direction)>0&&S.normal.multiplyScalar(-1));const y={a:d,b:g,c:_,normal:new nt,materialIndex:0};Ni.getNormal(ic,ac,sc,y.normal),S.face=y,S.barycoord=m}return S}class Ml extends cs{constructor(e=1,i=1,r=1,u=1,f=1,h=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:i,depth:r,widthSegments:u,heightSegments:f,depthSegments:h};const d=this;u=Math.floor(u),f=Math.floor(f),h=Math.floor(h);const g=[],_=[],S=[],m=[];let y=0,M=0;A("z","y","x",-1,-1,r,i,e,h,f,0),A("z","y","x",1,-1,r,i,-e,h,f,1),A("x","z","y",1,1,e,r,i,u,h,2),A("x","z","y",1,-1,e,r,-i,u,h,3),A("x","y","z",1,-1,e,i,r,u,f,4),A("x","y","z",-1,-1,e,i,-r,u,f,5),this.setIndex(g),this.setAttribute("position",new Qi(_,3)),this.setAttribute("normal",new Qi(S,3)),this.setAttribute("uv",new Qi(m,2));function A(R,x,v,z,P,D,H,B,O,k,w){const C=D/O,V=H/k,at=D/2,ut=H/2,_t=B/2,lt=O+1,W=k+1;let st=0,Z=0;const gt=new nt;for(let St=0;St<W;St++){const Ht=St*V-ut;for(let se=0;se<lt;se++){const Te=se*C-at;gt[R]=Te*z,gt[x]=Ht*P,gt[v]=_t,_.push(gt.x,gt.y,gt.z),gt[R]=0,gt[x]=0,gt[v]=B>0?1:-1,S.push(gt.x,gt.y,gt.z),m.push(se/O),m.push(1-St/k),st+=1}}for(let St=0;St<k;St++)for(let Ht=0;Ht<O;Ht++){const se=y+Ht+lt*St,Te=y+Ht+lt*(St+1),I=y+(Ht+1)+lt*(St+1),ct=y+(Ht+1)+lt*St;g.push(se,Te,ct),g.push(Te,I,ct),Z+=6}d.addGroup(M,Z,w),M+=Z,y+=st}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ml(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function lo(o){const e={};for(const i in o){e[i]={};for(const r in o[i]){const u=o[i][r];u&&(u.isColor||u.isMatrix3||u.isMatrix4||u.isVector2||u.isVector3||u.isVector4||u.isTexture||u.isQuaternion)?u.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[i][r]=null):e[i][r]=u.clone():Array.isArray(u)?e[i][r]=u.slice():e[i][r]=u}}return e}function Vn(o){const e={};for(let i=0;i<o.length;i++){const r=lo(o[i]);for(const u in r)e[u]=r[u]}return e}function iT(o){const e=[];for(let i=0;i<o.length;i++)e.push(o[i].clone());return e}function US(o){const e=o.getRenderTarget();return e===null?o.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:we.workingColorSpace}const aT={clone:lo,merge:Vn};var sT=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,rT=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class us extends xl{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=sT,this.fragmentShader=rT,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=lo(e.uniforms),this.uniformsGroups=iT(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const i=super.toJSON(e);i.glslVersion=this.glslVersion,i.uniforms={};for(const u in this.uniforms){const h=this.uniforms[u].value;h&&h.isTexture?i.uniforms[u]={type:"t",value:h.toJSON(e).uuid}:h&&h.isColor?i.uniforms[u]={type:"c",value:h.getHex()}:h&&h.isVector2?i.uniforms[u]={type:"v2",value:h.toArray()}:h&&h.isVector3?i.uniforms[u]={type:"v3",value:h.toArray()}:h&&h.isVector4?i.uniforms[u]={type:"v4",value:h.toArray()}:h&&h.isMatrix3?i.uniforms[u]={type:"m3",value:h.toArray()}:h&&h.isMatrix4?i.uniforms[u]={type:"m4",value:h.toArray()}:i.uniforms[u]={value:h}}Object.keys(this.defines).length>0&&(i.defines=this.defines),i.vertexShader=this.vertexShader,i.fragmentShader=this.fragmentShader,i.lights=this.lights,i.clipping=this.clipping;const r={};for(const u in this.extensions)this.extensions[u]===!0&&(r[u]=!0);return Object.keys(r).length>0&&(i.extensions=r),i}}class NS extends Dn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ke,this.projectionMatrix=new Ke,this.projectionMatrixInverse=new Ke,this.coordinateSystem=Ki,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,i){return super.copy(e,i),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,i){super.updateWorldMatrix(e,i),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const is=new nt,Uv=new ce,Nv=new ce;class xi extends NS{constructor(e=50,i=1,r=.1,u=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=u,this.focus=10,this.aspect=i,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,i){return super.copy(e,i),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const i=.5*this.getFilmHeight()/e;this.fov=gl*2*Math.atan(i),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(fl*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return gl*2*Math.atan(Math.tan(fl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,i,r){is.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(is.x,is.y).multiplyScalar(-e/is.z),is.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(is.x,is.y).multiplyScalar(-e/is.z)}getViewSize(e,i){return this.getViewBounds(e,Uv,Nv),i.subVectors(Nv,Uv)}setViewOffset(e,i,r,u,f,h){this.aspect=e/i,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=i,this.view.offsetX=r,this.view.offsetY=u,this.view.width=f,this.view.height=h,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let i=e*Math.tan(fl*.5*this.fov)/this.zoom,r=2*i,u=this.aspect*r,f=-.5*u;const h=this.view;if(this.view!==null&&this.view.enabled){const g=h.fullWidth,_=h.fullHeight;f+=h.offsetX*u/g,i-=h.offsetY*r/_,u*=h.width/g,r*=h.height/_}const d=this.filmOffset;d!==0&&(f+=e*d/this.getFilmWidth()),this.projectionMatrix.makePerspective(f,f+u,i,i-r,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const i=super.toJSON(e);return i.object.fov=this.fov,i.object.zoom=this.zoom,i.object.near=this.near,i.object.far=this.far,i.object.focus=this.focus,i.object.aspect=this.aspect,this.view!==null&&(i.object.view=Object.assign({},this.view)),i.object.filmGauge=this.filmGauge,i.object.filmOffset=this.filmOffset,i}}const jr=-90,Zr=1;class oT extends Dn{constructor(e,i,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;const u=new xi(jr,Zr,e,i);u.layers=this.layers,this.add(u);const f=new xi(jr,Zr,e,i);f.layers=this.layers,this.add(f);const h=new xi(jr,Zr,e,i);h.layers=this.layers,this.add(h);const d=new xi(jr,Zr,e,i);d.layers=this.layers,this.add(d);const g=new xi(jr,Zr,e,i);g.layers=this.layers,this.add(g);const _=new xi(jr,Zr,e,i);_.layers=this.layers,this.add(_)}updateCoordinateSystem(){const e=this.coordinateSystem,i=this.children.concat(),[r,u,f,h,d,g]=i;for(const _ of i)this.remove(_);if(e===Ki)r.up.set(0,1,0),r.lookAt(1,0,0),u.up.set(0,1,0),u.lookAt(-1,0,0),f.up.set(0,0,-1),f.lookAt(0,1,0),h.up.set(0,0,1),h.lookAt(0,-1,0),d.up.set(0,1,0),d.lookAt(0,0,1),g.up.set(0,1,0),g.lookAt(0,0,-1);else if(e===Ec)r.up.set(0,-1,0),r.lookAt(-1,0,0),u.up.set(0,-1,0),u.lookAt(1,0,0),f.up.set(0,0,1),f.lookAt(0,1,0),h.up.set(0,0,-1),h.lookAt(0,-1,0),d.up.set(0,-1,0),d.lookAt(0,0,1),g.up.set(0,-1,0),g.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const _ of i)this.add(_),_.updateMatrixWorld()}update(e,i){this.parent===null&&this.updateMatrixWorld();const{renderTarget:r,activeMipmapLevel:u}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[f,h,d,g,_,S]=this.children,m=e.getRenderTarget(),y=e.getActiveCubeFace(),M=e.getActiveMipmapLevel(),A=e.xr.enabled;e.xr.enabled=!1;const R=r.texture.generateMipmaps;r.texture.generateMipmaps=!1,e.setRenderTarget(r,0,u),e.render(i,f),e.setRenderTarget(r,1,u),e.render(i,h),e.setRenderTarget(r,2,u),e.render(i,d),e.setRenderTarget(r,3,u),e.render(i,g),e.setRenderTarget(r,4,u),e.render(i,_),r.texture.generateMipmaps=R,e.setRenderTarget(r,5,u),e.render(i,S),e.setRenderTarget(m,y,M),e.xr.enabled=A,r.texture.needsPMREMUpdate=!0}}class LS extends Xn{constructor(e=[],i=so,r,u,f,h,d,g,_,S){super(e,i,r,u,f,h,d,g,_,S),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class lT extends js{constructor(e=1,i={}){super(e,e,i),this.isWebGLCubeRenderTarget=!0;const r={width:e,height:e,depth:1},u=[r,r,r,r,r,r];this.texture=new LS(u),this._setTextureOptions(i),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,i){this.texture.type=i.type,this.texture.colorSpace=i.colorSpace,this.texture.generateMipmaps=i.generateMipmaps,this.texture.minFilter=i.minFilter,this.texture.magFilter=i.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},u=new Ml(5,5,5),f=new us({name:"CubemapFromEquirect",uniforms:lo(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:Kn,blending:rs});f.uniforms.tEquirect.value=i;const h=new Mi(u,f),d=i.minFilter;return i.minFilter===Ys&&(i.minFilter=ji),new oT(1,10,this).update(e,h),i.minFilter=d,h.geometry.dispose(),h.material.dispose(),this}clear(e,i=!0,r=!0,u=!0){const f=e.getRenderTarget();for(let h=0;h<6;h++)e.setRenderTarget(this,h),e.clear(i,r,u);e.setRenderTarget(f)}}class uc extends Dn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const uT={type:"move"};class wd{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new uc,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new uc,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new nt,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new nt),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new uc,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new nt,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new nt),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const i=this._hand;if(i)for(const r of e.hand.values())this._getHandJoint(i,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,i,r){let u=null,f=null,h=null;const d=this._targetRay,g=this._grip,_=this._hand;if(e&&i.session.visibilityState!=="visible-blurred"){if(_&&e.hand){h=!0;for(const R of e.hand.values()){const x=i.getJointPose(R,r),v=this._getHandJoint(_,R);x!==null&&(v.matrix.fromArray(x.transform.matrix),v.matrix.decompose(v.position,v.rotation,v.scale),v.matrixWorldNeedsUpdate=!0,v.jointRadius=x.radius),v.visible=x!==null}const S=_.joints["index-finger-tip"],m=_.joints["thumb-tip"],y=S.position.distanceTo(m.position),M=.02,A=.005;_.inputState.pinching&&y>M+A?(_.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!_.inputState.pinching&&y<=M-A&&(_.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else g!==null&&e.gripSpace&&(f=i.getPose(e.gripSpace,r),f!==null&&(g.matrix.fromArray(f.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,f.linearVelocity?(g.hasLinearVelocity=!0,g.linearVelocity.copy(f.linearVelocity)):g.hasLinearVelocity=!1,f.angularVelocity?(g.hasAngularVelocity=!0,g.angularVelocity.copy(f.angularVelocity)):g.hasAngularVelocity=!1));d!==null&&(u=i.getPose(e.targetRaySpace,r),u===null&&f!==null&&(u=f),u!==null&&(d.matrix.fromArray(u.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,u.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(u.linearVelocity)):d.hasLinearVelocity=!1,u.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(u.angularVelocity)):d.hasAngularVelocity=!1,this.dispatchEvent(uT)))}return d!==null&&(d.visible=u!==null),g!==null&&(g.visible=f!==null),_!==null&&(_.visible=h!==null),this}_getHandJoint(e,i){if(e.joints[i.jointName]===void 0){const r=new uc;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[i.jointName]=r,e.add(r)}return e.joints[i.jointName]}}class cT extends Dn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new $i,this.environmentIntensity=1,this.environmentRotation=new $i,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,i){return super.copy(e,i),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const i=super.toJSON(e);return this.fog!==null&&(i.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(i.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(i.object.backgroundIntensity=this.backgroundIntensity),i.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(i.object.environmentIntensity=this.environmentIntensity),i.object.environmentRotation=this.environmentRotation.toArray(),i}}class fT extends Xn{constructor(e=null,i=1,r=1,u,f,h,d,g,_=ui,S=ui,m,y){super(null,h,d,g,_,S,u,f,m,y),this.isDataTexture=!0,this.image={data:e,width:i,height:r},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Lv extends Oi{constructor(e,i,r,u=1){super(e,i,r),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=u}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Kr=new Ke,Ov=new Ke,cc=[],Pv=new Ks,hT=new Ke,ll=new Mi,ul=new yl;class dT extends Mi{constructor(e,i,r){super(e,i),this.isInstancedMesh=!0,this.instanceMatrix=new Lv(new Float32Array(r*16),16),this.instanceColor=null,this.morphTexture=null,this.count=r,this.boundingBox=null,this.boundingSphere=null;for(let u=0;u<r;u++)this.setMatrixAt(u,hT)}computeBoundingBox(){const e=this.geometry,i=this.count;this.boundingBox===null&&(this.boundingBox=new Ks),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let r=0;r<i;r++)this.getMatrixAt(r,Kr),Pv.copy(e.boundingBox).applyMatrix4(Kr),this.boundingBox.union(Pv)}computeBoundingSphere(){const e=this.geometry,i=this.count;this.boundingSphere===null&&(this.boundingSphere=new yl),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let r=0;r<i;r++)this.getMatrixAt(r,Kr),ul.copy(e.boundingSphere).applyMatrix4(Kr),this.boundingSphere.union(ul)}copy(e,i){return super.copy(e,i),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,i){i.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,i){i.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,i){const r=i.morphTargetInfluences,u=this.morphTexture.source.data.data,f=r.length+1,h=e*f+1;for(let d=0;d<r.length;d++)r[d]=u[h+d]}raycast(e,i){const r=this.matrixWorld,u=this.count;if(ll.geometry=this.geometry,ll.material=this.material,ll.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ul.copy(this.boundingSphere),ul.applyMatrix4(r),e.ray.intersectsSphere(ul)!==!1))for(let f=0;f<u;f++){this.getMatrixAt(f,Kr),Ov.multiplyMatrices(r,Kr),ll.matrixWorld=Ov,ll.raycast(e,cc);for(let h=0,d=cc.length;h<d;h++){const g=cc[h];g.instanceId=f,g.object=this,i.push(g)}cc.length=0}}setColorAt(e,i){this.instanceColor===null&&(this.instanceColor=new Lv(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),i.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,i){i.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,i){const r=i.morphTargetInfluences,u=r.length+1;this.morphTexture===null&&(this.morphTexture=new fT(new Float32Array(u*this.count),u,this.count,Pp,Zi));const f=this.morphTexture.source.data.data;let h=0;for(let _=0;_<r.length;_++)h+=r[_];const d=this.geometry.morphTargetsRelative?1:1-h,g=u*e;f[g]=d,f.set(r,g+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Dd=new nt,pT=new nt,mT=new de;class as{constructor(e=new nt(1,0,0),i=0){this.isPlane=!0,this.normal=e,this.constant=i}set(e,i){return this.normal.copy(e),this.constant=i,this}setComponents(e,i,r,u){return this.normal.set(e,i,r),this.constant=u,this}setFromNormalAndCoplanarPoint(e,i){return this.normal.copy(e),this.constant=-i.dot(this.normal),this}setFromCoplanarPoints(e,i,r){const u=Dd.subVectors(r,i).cross(pT.subVectors(e,i)).normalize();return this.setFromNormalAndCoplanarPoint(u,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,i){return i.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,i){const r=e.delta(Dd),u=this.normal.dot(r);if(u===0)return this.distanceToPoint(e.start)===0?i.copy(e.start):null;const f=-(e.start.dot(this.normal)+this.constant)/u;return f<0||f>1?null:i.copy(e.start).addScaledVector(r,f)}intersectsLine(e){const i=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return i<0&&r>0||r<0&&i>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,i){const r=i||mT.getNormalMatrix(e),u=this.coplanarPoint(Dd).applyMatrix4(e),f=this.normal.applyMatrix3(r).normalize();return this.constant=-u.dot(f),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Bs=new yl,_T=new ce(.5,.5),fc=new nt;class kp{constructor(e=new as,i=new as,r=new as,u=new as,f=new as,h=new as){this.planes=[e,i,r,u,f,h]}set(e,i,r,u,f,h){const d=this.planes;return d[0].copy(e),d[1].copy(i),d[2].copy(r),d[3].copy(u),d[4].copy(f),d[5].copy(h),this}copy(e){const i=this.planes;for(let r=0;r<6;r++)i[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,i=Ki,r=!1){const u=this.planes,f=e.elements,h=f[0],d=f[1],g=f[2],_=f[3],S=f[4],m=f[5],y=f[6],M=f[7],A=f[8],R=f[9],x=f[10],v=f[11],z=f[12],P=f[13],D=f[14],H=f[15];if(u[0].setComponents(_-h,M-S,v-A,H-z).normalize(),u[1].setComponents(_+h,M+S,v+A,H+z).normalize(),u[2].setComponents(_+d,M+m,v+R,H+P).normalize(),u[3].setComponents(_-d,M-m,v-R,H-P).normalize(),r)u[4].setComponents(g,y,x,D).normalize(),u[5].setComponents(_-g,M-y,v-x,H-D).normalize();else if(u[4].setComponents(_-g,M-y,v-x,H-D).normalize(),i===Ki)u[5].setComponents(_+g,M+y,v+x,H+D).normalize();else if(i===Ec)u[5].setComponents(g,y,x,D).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+i);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Bs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const i=e.geometry;i.boundingSphere===null&&i.computeBoundingSphere(),Bs.copy(i.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Bs)}intersectsSprite(e){Bs.center.set(0,0,0);const i=_T.distanceTo(e.center);return Bs.radius=.7071067811865476+i,Bs.applyMatrix4(e.matrixWorld),this.intersectsSphere(Bs)}intersectsSphere(e){const i=this.planes,r=e.center,u=-e.radius;for(let f=0;f<6;f++)if(i[f].distanceToPoint(r)<u)return!1;return!0}intersectsBox(e){const i=this.planes;for(let r=0;r<6;r++){const u=i[r];if(fc.x=u.normal.x>0?e.max.x:e.min.x,fc.y=u.normal.y>0?e.max.y:e.min.y,fc.z=u.normal.z>0?e.max.z:e.min.z,u.distanceToPoint(fc)<0)return!1}return!0}containsPoint(e){const i=this.planes;for(let r=0;r<6;r++)if(i[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class OS extends Xn{constructor(e,i,r=qs,u,f,h,d=ui,g=ui,_,S=ml,m=1){if(S!==ml&&S!==_l)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const y={width:e,height:i,depth:m};super(y,u,f,h,d,g,S,r,_),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Hp(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const i=super.toJSON(e);return this.compareFunction!==null&&(i.compareFunction=this.compareFunction),i}}class PS extends Xn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Rc extends cs{constructor(e=1,i=1,r=1,u=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:i,widthSegments:r,heightSegments:u};const f=e/2,h=i/2,d=Math.floor(r),g=Math.floor(u),_=d+1,S=g+1,m=e/d,y=i/g,M=[],A=[],R=[],x=[];for(let v=0;v<S;v++){const z=v*y-h;for(let P=0;P<_;P++){const D=P*m-f;A.push(D,-z,0),R.push(0,0,1),x.push(P/d),x.push(1-v/g)}}for(let v=0;v<g;v++)for(let z=0;z<d;z++){const P=z+_*v,D=z+_*(v+1),H=z+1+_*(v+1),B=z+1+_*v;M.push(P,D,B),M.push(D,H,B)}this.setIndex(M),this.setAttribute("position",new Qi(A,3)),this.setAttribute("normal",new Qi(R,3)),this.setAttribute("uv",new Qi(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Rc(e.width,e.height,e.widthSegments,e.heightSegments)}}class bc extends cs{constructor(e=1,i=32,r=16,u=0,f=Math.PI*2,h=0,d=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:i,heightSegments:r,phiStart:u,phiLength:f,thetaStart:h,thetaLength:d},i=Math.max(3,Math.floor(i)),r=Math.max(2,Math.floor(r));const g=Math.min(h+d,Math.PI);let _=0;const S=[],m=new nt,y=new nt,M=[],A=[],R=[],x=[];for(let v=0;v<=r;v++){const z=[],P=v/r;let D=0;v===0&&h===0?D=.5/i:v===r&&g===Math.PI&&(D=-.5/i);for(let H=0;H<=i;H++){const B=H/i;m.x=-e*Math.cos(u+B*f)*Math.sin(h+P*d),m.y=e*Math.cos(h+P*d),m.z=e*Math.sin(u+B*f)*Math.sin(h+P*d),A.push(m.x,m.y,m.z),y.copy(m).normalize(),R.push(y.x,y.y,y.z),x.push(B+D,1-P),z.push(_++)}S.push(z)}for(let v=0;v<r;v++)for(let z=0;z<i;z++){const P=S[v][z+1],D=S[v][z],H=S[v+1][z],B=S[v+1][z+1];(v!==0||h>0)&&M.push(P,D,B),(v!==r-1||g<Math.PI)&&M.push(D,H,B)}this.setIndex(M),this.setAttribute("position",new Qi(A,3)),this.setAttribute("normal",new Qi(R,3)),this.setAttribute("uv",new Qi(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new bc(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class gT extends xl{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new De(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new De(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=TS,this.normalScale=new ce(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $i,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class vT extends xl{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=hE,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class ST extends xl{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class zS extends Dn{constructor(e,i=1){super(),this.isLight=!0,this.type="Light",this.color=new De(e),this.intensity=i}dispose(){}copy(e,i){return super.copy(e,i),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const i=super.toJSON(e);return i.object.color=this.color.getHex(),i.object.intensity=this.intensity,this.groundColor!==void 0&&(i.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(i.object.distance=this.distance),this.angle!==void 0&&(i.object.angle=this.angle),this.decay!==void 0&&(i.object.decay=this.decay),this.penumbra!==void 0&&(i.object.penumbra=this.penumbra),this.shadow!==void 0&&(i.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(i.object.target=this.target.uuid),i}}class yT extends zS{constructor(e,i,r){super(e,r),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Dn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new De(i)}copy(e,i){return super.copy(e,i),this.groundColor.copy(e.groundColor),this}}const Ud=new Ke,zv=new nt,Iv=new nt;class xT{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ce(512,512),this.mapType=Ji,this.map=null,this.mapPass=null,this.matrix=new Ke,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new kp,this._frameExtents=new ce(1,1),this._viewportCount=1,this._viewports=[new sn(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const i=this.camera,r=this.matrix;zv.setFromMatrixPosition(e.matrixWorld),i.position.copy(zv),Iv.setFromMatrixPosition(e.target.matrixWorld),i.lookAt(Iv),i.updateMatrixWorld(),Ud.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ud,i.coordinateSystem,i.reversedDepth),i.reversedDepth?r.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):r.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),r.multiply(Ud)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class IS extends NS{constructor(e=-1,i=1,r=1,u=-1,f=.1,h=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=i,this.top=r,this.bottom=u,this.near=f,this.far=h,this.updateProjectionMatrix()}copy(e,i){return super.copy(e,i),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,i,r,u,f,h){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=i,this.view.offsetX=r,this.view.offsetY=u,this.view.width=f,this.view.height=h,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),i=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,u=(this.top+this.bottom)/2;let f=r-e,h=r+e,d=u+i,g=u-i;if(this.view!==null&&this.view.enabled){const _=(this.right-this.left)/this.view.fullWidth/this.zoom,S=(this.top-this.bottom)/this.view.fullHeight/this.zoom;f+=_*this.view.offsetX,h=f+_*this.view.width,d-=S*this.view.offsetY,g=d-S*this.view.height}this.projectionMatrix.makeOrthographic(f,h,d,g,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const i=super.toJSON(e);return i.object.zoom=this.zoom,i.object.left=this.left,i.object.right=this.right,i.object.top=this.top,i.object.bottom=this.bottom,i.object.near=this.near,i.object.far=this.far,this.view!==null&&(i.object.view=Object.assign({},this.view)),i}}class MT extends xT{constructor(){super(new IS(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class ET extends zS{constructor(e,i){super(e,i),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Dn.DEFAULT_UP),this.updateMatrix(),this.target=new Dn,this.shadow=new MT}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class TT extends xi{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const Bv=new Ke;class bT{constructor(e,i,r=0,u=1/0){this.ray=new Gp(e,i),this.near=r,this.far=u,this.camera=null,this.layers=new Vp,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,i){this.ray.set(e,i)}setFromCamera(e,i){i.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(i.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(i).sub(this.ray.origin).normalize(),this.camera=i):i.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(i.near+i.far)/(i.near-i.far)).unproject(i),this.ray.direction.set(0,0,-1).transformDirection(i.matrixWorld),this.camera=i):console.error("THREE.Raycaster: Unsupported camera type: "+i.type)}setFromXRController(e){return Bv.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Bv),this}intersectObject(e,i=!0,r=[]){return Cp(e,this,r,i),r.sort(Fv),r}intersectObjects(e,i=!0,r=[]){for(let u=0,f=e.length;u<f;u++)Cp(e[u],this,r,i);return r.sort(Fv),r}}function Fv(o,e){return o.distance-e.distance}function Cp(o,e,i,r){let u=!0;if(o.layers.test(e.layers)&&o.raycast(e,i)===!1&&(u=!1),u===!0&&r===!0){const f=o.children;for(let h=0,d=f.length;h<d;h++)Cp(f[h],e,i,!0)}}class Hv{constructor(e=1,i=0,r=0){this.radius=e,this.phi=i,this.theta=r}set(e,i,r){return this.radius=e,this.phi=i,this.theta=r,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=ve(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,i,r){return this.radius=Math.sqrt(e*e+i*i+r*r),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,r),this.phi=Math.acos(ve(i/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class AT extends Zs{constructor(e,i=null){super(),this.object=e,this.domElement=i,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){console.warn("THREE.Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function Gv(o,e,i,r){const u=RT(r);switch(i){case xS:return o*e;case Pp:return o*e/u.components*u.byteLength;case zp:return o*e/u.components*u.byteLength;case ES:return o*e*2/u.components*u.byteLength;case Ip:return o*e*2/u.components*u.byteLength;case MS:return o*e*3/u.components*u.byteLength;case Li:return o*e*4/u.components*u.byteLength;case Bp:return o*e*4/u.components*u.byteLength;case _c:case gc:return Math.floor((o+3)/4)*Math.floor((e+3)/4)*8;case vc:case Sc:return Math.floor((o+3)/4)*Math.floor((e+3)/4)*16;case tp:case np:return Math.max(o,16)*Math.max(e,8)/4;case $d:case ep:return Math.max(o,8)*Math.max(e,8)/2;case ip:case ap:return Math.floor((o+3)/4)*Math.floor((e+3)/4)*8;case sp:return Math.floor((o+3)/4)*Math.floor((e+3)/4)*16;case rp:return Math.floor((o+3)/4)*Math.floor((e+3)/4)*16;case op:return Math.floor((o+4)/5)*Math.floor((e+3)/4)*16;case lp:return Math.floor((o+4)/5)*Math.floor((e+4)/5)*16;case up:return Math.floor((o+5)/6)*Math.floor((e+4)/5)*16;case cp:return Math.floor((o+5)/6)*Math.floor((e+5)/6)*16;case fp:return Math.floor((o+7)/8)*Math.floor((e+4)/5)*16;case hp:return Math.floor((o+7)/8)*Math.floor((e+5)/6)*16;case dp:return Math.floor((o+7)/8)*Math.floor((e+7)/8)*16;case pp:return Math.floor((o+9)/10)*Math.floor((e+4)/5)*16;case mp:return Math.floor((o+9)/10)*Math.floor((e+5)/6)*16;case _p:return Math.floor((o+9)/10)*Math.floor((e+7)/8)*16;case gp:return Math.floor((o+9)/10)*Math.floor((e+9)/10)*16;case vp:return Math.floor((o+11)/12)*Math.floor((e+9)/10)*16;case Sp:return Math.floor((o+11)/12)*Math.floor((e+11)/12)*16;case yp:case xp:case Mp:return Math.ceil(o/4)*Math.ceil(e/4)*16;case Ep:case Tp:return Math.ceil(o/4)*Math.ceil(e/4)*8;case bp:case Ap:return Math.ceil(o/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${i} format.`)}function RT(o){switch(o){case Ji:case gS:return{byteLength:1,components:1};case dl:case vS:case Sl:return{byteLength:2,components:1};case Lp:case Op:return{byteLength:2,components:4};case qs:case Np:case Zi:return{byteLength:4,components:1};case SS:case yS:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${o}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Up}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Up);function BS(){let o=null,e=!1,i=null,r=null;function u(f,h){i(f,h),r=o.requestAnimationFrame(u)}return{start:function(){e!==!0&&i!==null&&(r=o.requestAnimationFrame(u),e=!0)},stop:function(){o.cancelAnimationFrame(r),e=!1},setAnimationLoop:function(f){i=f},setContext:function(f){o=f}}}function CT(o){const e=new WeakMap;function i(d,g){const _=d.array,S=d.usage,m=_.byteLength,y=o.createBuffer();o.bindBuffer(g,y),o.bufferData(g,_,S),d.onUploadCallback();let M;if(_ instanceof Float32Array)M=o.FLOAT;else if(typeof Float16Array<"u"&&_ instanceof Float16Array)M=o.HALF_FLOAT;else if(_ instanceof Uint16Array)d.isFloat16BufferAttribute?M=o.HALF_FLOAT:M=o.UNSIGNED_SHORT;else if(_ instanceof Int16Array)M=o.SHORT;else if(_ instanceof Uint32Array)M=o.UNSIGNED_INT;else if(_ instanceof Int32Array)M=o.INT;else if(_ instanceof Int8Array)M=o.BYTE;else if(_ instanceof Uint8Array)M=o.UNSIGNED_BYTE;else if(_ instanceof Uint8ClampedArray)M=o.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+_);return{buffer:y,type:M,bytesPerElement:_.BYTES_PER_ELEMENT,version:d.version,size:m}}function r(d,g,_){const S=g.array,m=g.updateRanges;if(o.bindBuffer(_,d),m.length===0)o.bufferSubData(_,0,S);else{m.sort((M,A)=>M.start-A.start);let y=0;for(let M=1;M<m.length;M++){const A=m[y],R=m[M];R.start<=A.start+A.count+1?A.count=Math.max(A.count,R.start+R.count-A.start):(++y,m[y]=R)}m.length=y+1;for(let M=0,A=m.length;M<A;M++){const R=m[M];o.bufferSubData(_,R.start*S.BYTES_PER_ELEMENT,S,R.start,R.count)}g.clearUpdateRanges()}g.onUploadCallback()}function u(d){return d.isInterleavedBufferAttribute&&(d=d.data),e.get(d)}function f(d){d.isInterleavedBufferAttribute&&(d=d.data);const g=e.get(d);g&&(o.deleteBuffer(g.buffer),e.delete(d))}function h(d,g){if(d.isInterleavedBufferAttribute&&(d=d.data),d.isGLBufferAttribute){const S=e.get(d);(!S||S.version<d.version)&&e.set(d,{buffer:d.buffer,type:d.type,bytesPerElement:d.elementSize,version:d.version});return}const _=e.get(d);if(_===void 0)e.set(d,i(d,g));else if(_.version<d.version){if(_.size!==d.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(_.buffer,d,g),_.version=d.version}}return{get:u,remove:f,update:h}}var wT=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,DT=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,UT=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,NT=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,LT=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,OT=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,PT=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,zT=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,IT=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,BT=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,FT=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,HT=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,GT=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,VT=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,XT=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,kT=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,YT=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,qT=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,WT=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,jT=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,ZT=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,KT=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,QT=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,JT=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,$T=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,tb=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,eb=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,nb=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ib=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ab=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,sb="gl_FragColor = linearToOutputTexel( gl_FragColor );",rb=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,ob=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,lb=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,ub=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,cb=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,fb=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,hb=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,db=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,pb=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,mb=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,_b=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,gb=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,vb=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Sb=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,yb=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,xb=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Mb=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Eb=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Tb=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,bb=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ab=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Rb=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Cb=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,wb=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Db=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ub=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Nb=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Lb=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ob=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Pb=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,zb=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ib=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Bb=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Fb=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Hb=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Gb=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Vb=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Xb=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,kb=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Yb=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,qb=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Wb=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,jb=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Zb=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Kb=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Qb=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Jb=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,$b=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,tA=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,eA=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,nA=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,iA=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,aA=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,sA=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,rA=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,oA=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,lA=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,uA=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,cA=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,fA=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,hA=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,dA=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,pA=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,mA=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,_A=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,gA=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,vA=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,SA=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,yA=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,xA=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,MA=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,EA=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,TA=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,bA=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,AA=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,RA=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const CA=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,wA=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,DA=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,UA=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,NA=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,LA=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,OA=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,PA=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,zA=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,IA=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,BA=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,FA=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,HA=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,GA=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,VA=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,XA=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kA=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,YA=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qA=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,WA=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jA=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ZA=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,KA=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,QA=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,JA=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,$A=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,t1=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,e1=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,n1=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,i1=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,a1=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,s1=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,r1=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,o1=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,pe={alphahash_fragment:wT,alphahash_pars_fragment:DT,alphamap_fragment:UT,alphamap_pars_fragment:NT,alphatest_fragment:LT,alphatest_pars_fragment:OT,aomap_fragment:PT,aomap_pars_fragment:zT,batching_pars_vertex:IT,batching_vertex:BT,begin_vertex:FT,beginnormal_vertex:HT,bsdfs:GT,iridescence_fragment:VT,bumpmap_pars_fragment:XT,clipping_planes_fragment:kT,clipping_planes_pars_fragment:YT,clipping_planes_pars_vertex:qT,clipping_planes_vertex:WT,color_fragment:jT,color_pars_fragment:ZT,color_pars_vertex:KT,color_vertex:QT,common:JT,cube_uv_reflection_fragment:$T,defaultnormal_vertex:tb,displacementmap_pars_vertex:eb,displacementmap_vertex:nb,emissivemap_fragment:ib,emissivemap_pars_fragment:ab,colorspace_fragment:sb,colorspace_pars_fragment:rb,envmap_fragment:ob,envmap_common_pars_fragment:lb,envmap_pars_fragment:ub,envmap_pars_vertex:cb,envmap_physical_pars_fragment:xb,envmap_vertex:fb,fog_vertex:hb,fog_pars_vertex:db,fog_fragment:pb,fog_pars_fragment:mb,gradientmap_pars_fragment:_b,lightmap_pars_fragment:gb,lights_lambert_fragment:vb,lights_lambert_pars_fragment:Sb,lights_pars_begin:yb,lights_toon_fragment:Mb,lights_toon_pars_fragment:Eb,lights_phong_fragment:Tb,lights_phong_pars_fragment:bb,lights_physical_fragment:Ab,lights_physical_pars_fragment:Rb,lights_fragment_begin:Cb,lights_fragment_maps:wb,lights_fragment_end:Db,logdepthbuf_fragment:Ub,logdepthbuf_pars_fragment:Nb,logdepthbuf_pars_vertex:Lb,logdepthbuf_vertex:Ob,map_fragment:Pb,map_pars_fragment:zb,map_particle_fragment:Ib,map_particle_pars_fragment:Bb,metalnessmap_fragment:Fb,metalnessmap_pars_fragment:Hb,morphinstance_vertex:Gb,morphcolor_vertex:Vb,morphnormal_vertex:Xb,morphtarget_pars_vertex:kb,morphtarget_vertex:Yb,normal_fragment_begin:qb,normal_fragment_maps:Wb,normal_pars_fragment:jb,normal_pars_vertex:Zb,normal_vertex:Kb,normalmap_pars_fragment:Qb,clearcoat_normal_fragment_begin:Jb,clearcoat_normal_fragment_maps:$b,clearcoat_pars_fragment:tA,iridescence_pars_fragment:eA,opaque_fragment:nA,packing:iA,premultiplied_alpha_fragment:aA,project_vertex:sA,dithering_fragment:rA,dithering_pars_fragment:oA,roughnessmap_fragment:lA,roughnessmap_pars_fragment:uA,shadowmap_pars_fragment:cA,shadowmap_pars_vertex:fA,shadowmap_vertex:hA,shadowmask_pars_fragment:dA,skinbase_vertex:pA,skinning_pars_vertex:mA,skinning_vertex:_A,skinnormal_vertex:gA,specularmap_fragment:vA,specularmap_pars_fragment:SA,tonemapping_fragment:yA,tonemapping_pars_fragment:xA,transmission_fragment:MA,transmission_pars_fragment:EA,uv_pars_fragment:TA,uv_pars_vertex:bA,uv_vertex:AA,worldpos_vertex:RA,background_vert:CA,background_frag:wA,backgroundCube_vert:DA,backgroundCube_frag:UA,cube_vert:NA,cube_frag:LA,depth_vert:OA,depth_frag:PA,distanceRGBA_vert:zA,distanceRGBA_frag:IA,equirect_vert:BA,equirect_frag:FA,linedashed_vert:HA,linedashed_frag:GA,meshbasic_vert:VA,meshbasic_frag:XA,meshlambert_vert:kA,meshlambert_frag:YA,meshmatcap_vert:qA,meshmatcap_frag:WA,meshnormal_vert:jA,meshnormal_frag:ZA,meshphong_vert:KA,meshphong_frag:QA,meshphysical_vert:JA,meshphysical_frag:$A,meshtoon_vert:t1,meshtoon_frag:e1,points_vert:n1,points_frag:i1,shadow_vert:a1,shadow_frag:s1,sprite_vert:r1,sprite_frag:o1},zt={common:{diffuse:{value:new De(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new de},alphaMap:{value:null},alphaMapTransform:{value:new de},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new de}},envmap:{envMap:{value:null},envMapRotation:{value:new de},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new de}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new de}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new de},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new de},normalScale:{value:new ce(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new de},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new de}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new de}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new de}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new De(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new De(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new de},alphaTest:{value:0},uvTransform:{value:new de}},sprite:{diffuse:{value:new De(16777215)},opacity:{value:1},center:{value:new ce(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new de},alphaMap:{value:null},alphaMapTransform:{value:new de},alphaTest:{value:0}}},Wi={basic:{uniforms:Vn([zt.common,zt.specularmap,zt.envmap,zt.aomap,zt.lightmap,zt.fog]),vertexShader:pe.meshbasic_vert,fragmentShader:pe.meshbasic_frag},lambert:{uniforms:Vn([zt.common,zt.specularmap,zt.envmap,zt.aomap,zt.lightmap,zt.emissivemap,zt.bumpmap,zt.normalmap,zt.displacementmap,zt.fog,zt.lights,{emissive:{value:new De(0)}}]),vertexShader:pe.meshlambert_vert,fragmentShader:pe.meshlambert_frag},phong:{uniforms:Vn([zt.common,zt.specularmap,zt.envmap,zt.aomap,zt.lightmap,zt.emissivemap,zt.bumpmap,zt.normalmap,zt.displacementmap,zt.fog,zt.lights,{emissive:{value:new De(0)},specular:{value:new De(1118481)},shininess:{value:30}}]),vertexShader:pe.meshphong_vert,fragmentShader:pe.meshphong_frag},standard:{uniforms:Vn([zt.common,zt.envmap,zt.aomap,zt.lightmap,zt.emissivemap,zt.bumpmap,zt.normalmap,zt.displacementmap,zt.roughnessmap,zt.metalnessmap,zt.fog,zt.lights,{emissive:{value:new De(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:pe.meshphysical_vert,fragmentShader:pe.meshphysical_frag},toon:{uniforms:Vn([zt.common,zt.aomap,zt.lightmap,zt.emissivemap,zt.bumpmap,zt.normalmap,zt.displacementmap,zt.gradientmap,zt.fog,zt.lights,{emissive:{value:new De(0)}}]),vertexShader:pe.meshtoon_vert,fragmentShader:pe.meshtoon_frag},matcap:{uniforms:Vn([zt.common,zt.bumpmap,zt.normalmap,zt.displacementmap,zt.fog,{matcap:{value:null}}]),vertexShader:pe.meshmatcap_vert,fragmentShader:pe.meshmatcap_frag},points:{uniforms:Vn([zt.points,zt.fog]),vertexShader:pe.points_vert,fragmentShader:pe.points_frag},dashed:{uniforms:Vn([zt.common,zt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:pe.linedashed_vert,fragmentShader:pe.linedashed_frag},depth:{uniforms:Vn([zt.common,zt.displacementmap]),vertexShader:pe.depth_vert,fragmentShader:pe.depth_frag},normal:{uniforms:Vn([zt.common,zt.bumpmap,zt.normalmap,zt.displacementmap,{opacity:{value:1}}]),vertexShader:pe.meshnormal_vert,fragmentShader:pe.meshnormal_frag},sprite:{uniforms:Vn([zt.sprite,zt.fog]),vertexShader:pe.sprite_vert,fragmentShader:pe.sprite_frag},background:{uniforms:{uvTransform:{value:new de},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:pe.background_vert,fragmentShader:pe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new de}},vertexShader:pe.backgroundCube_vert,fragmentShader:pe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:pe.cube_vert,fragmentShader:pe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:pe.equirect_vert,fragmentShader:pe.equirect_frag},distanceRGBA:{uniforms:Vn([zt.common,zt.displacementmap,{referencePosition:{value:new nt},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:pe.distanceRGBA_vert,fragmentShader:pe.distanceRGBA_frag},shadow:{uniforms:Vn([zt.lights,zt.fog,{color:{value:new De(0)},opacity:{value:1}}]),vertexShader:pe.shadow_vert,fragmentShader:pe.shadow_frag}};Wi.physical={uniforms:Vn([Wi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new de},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new de},clearcoatNormalScale:{value:new ce(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new de},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new de},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new de},sheen:{value:0},sheenColor:{value:new De(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new de},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new de},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new de},transmissionSamplerSize:{value:new ce},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new de},attenuationDistance:{value:0},attenuationColor:{value:new De(0)},specularColor:{value:new De(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new de},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new de},anisotropyVector:{value:new ce},anisotropyMap:{value:null},anisotropyMapTransform:{value:new de}}]),vertexShader:pe.meshphysical_vert,fragmentShader:pe.meshphysical_frag};const hc={r:0,b:0,g:0},Fs=new $i,l1=new Ke;function u1(o,e,i,r,u,f,h){const d=new De(0);let g=f===!0?0:1,_,S,m=null,y=0,M=null;function A(P){let D=P.isScene===!0?P.background:null;return D&&D.isTexture&&(D=(P.backgroundBlurriness>0?i:e).get(D)),D}function R(P){let D=!1;const H=A(P);H===null?v(d,g):H&&H.isColor&&(v(H,1),D=!0);const B=o.xr.getEnvironmentBlendMode();B==="additive"?r.buffers.color.setClear(0,0,0,1,h):B==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,h),(o.autoClear||D)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),o.clear(o.autoClearColor,o.autoClearDepth,o.autoClearStencil))}function x(P,D){const H=A(D);H&&(H.isCubeTexture||H.mapping===Ac)?(S===void 0&&(S=new Mi(new Ml(1,1,1),new us({name:"BackgroundCubeMaterial",uniforms:lo(Wi.backgroundCube.uniforms),vertexShader:Wi.backgroundCube.vertexShader,fragmentShader:Wi.backgroundCube.fragmentShader,side:Kn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),S.geometry.deleteAttribute("normal"),S.geometry.deleteAttribute("uv"),S.onBeforeRender=function(B,O,k){this.matrixWorld.copyPosition(k.matrixWorld)},Object.defineProperty(S.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),u.update(S)),Fs.copy(D.backgroundRotation),Fs.x*=-1,Fs.y*=-1,Fs.z*=-1,H.isCubeTexture&&H.isRenderTargetTexture===!1&&(Fs.y*=-1,Fs.z*=-1),S.material.uniforms.envMap.value=H,S.material.uniforms.flipEnvMap.value=H.isCubeTexture&&H.isRenderTargetTexture===!1?-1:1,S.material.uniforms.backgroundBlurriness.value=D.backgroundBlurriness,S.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,S.material.uniforms.backgroundRotation.value.setFromMatrix4(l1.makeRotationFromEuler(Fs)),S.material.toneMapped=we.getTransfer(H.colorSpace)!==Ve,(m!==H||y!==H.version||M!==o.toneMapping)&&(S.material.needsUpdate=!0,m=H,y=H.version,M=o.toneMapping),S.layers.enableAll(),P.unshift(S,S.geometry,S.material,0,0,null)):H&&H.isTexture&&(_===void 0&&(_=new Mi(new Rc(2,2),new us({name:"BackgroundMaterial",uniforms:lo(Wi.background.uniforms),vertexShader:Wi.background.vertexShader,fragmentShader:Wi.background.fragmentShader,side:ls,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),_.geometry.deleteAttribute("normal"),Object.defineProperty(_.material,"map",{get:function(){return this.uniforms.t2D.value}}),u.update(_)),_.material.uniforms.t2D.value=H,_.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,_.material.toneMapped=we.getTransfer(H.colorSpace)!==Ve,H.matrixAutoUpdate===!0&&H.updateMatrix(),_.material.uniforms.uvTransform.value.copy(H.matrix),(m!==H||y!==H.version||M!==o.toneMapping)&&(_.material.needsUpdate=!0,m=H,y=H.version,M=o.toneMapping),_.layers.enableAll(),P.unshift(_,_.geometry,_.material,0,0,null))}function v(P,D){P.getRGB(hc,US(o)),r.buffers.color.setClear(hc.r,hc.g,hc.b,D,h)}function z(){S!==void 0&&(S.geometry.dispose(),S.material.dispose(),S=void 0),_!==void 0&&(_.geometry.dispose(),_.material.dispose(),_=void 0)}return{getClearColor:function(){return d},setClearColor:function(P,D=1){d.set(P),g=D,v(d,g)},getClearAlpha:function(){return g},setClearAlpha:function(P){g=P,v(d,g)},render:R,addToRenderList:x,dispose:z}}function c1(o,e){const i=o.getParameter(o.MAX_VERTEX_ATTRIBS),r={},u=y(null);let f=u,h=!1;function d(C,V,at,ut,_t){let lt=!1;const W=m(ut,at,V);f!==W&&(f=W,_(f.object)),lt=M(C,ut,at,_t),lt&&A(C,ut,at,_t),_t!==null&&e.update(_t,o.ELEMENT_ARRAY_BUFFER),(lt||h)&&(h=!1,D(C,V,at,ut),_t!==null&&o.bindBuffer(o.ELEMENT_ARRAY_BUFFER,e.get(_t).buffer))}function g(){return o.createVertexArray()}function _(C){return o.bindVertexArray(C)}function S(C){return o.deleteVertexArray(C)}function m(C,V,at){const ut=at.wireframe===!0;let _t=r[C.id];_t===void 0&&(_t={},r[C.id]=_t);let lt=_t[V.id];lt===void 0&&(lt={},_t[V.id]=lt);let W=lt[ut];return W===void 0&&(W=y(g()),lt[ut]=W),W}function y(C){const V=[],at=[],ut=[];for(let _t=0;_t<i;_t++)V[_t]=0,at[_t]=0,ut[_t]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:V,enabledAttributes:at,attributeDivisors:ut,object:C,attributes:{},index:null}}function M(C,V,at,ut){const _t=f.attributes,lt=V.attributes;let W=0;const st=at.getAttributes();for(const Z in st)if(st[Z].location>=0){const St=_t[Z];let Ht=lt[Z];if(Ht===void 0&&(Z==="instanceMatrix"&&C.instanceMatrix&&(Ht=C.instanceMatrix),Z==="instanceColor"&&C.instanceColor&&(Ht=C.instanceColor)),St===void 0||St.attribute!==Ht||Ht&&St.data!==Ht.data)return!0;W++}return f.attributesNum!==W||f.index!==ut}function A(C,V,at,ut){const _t={},lt=V.attributes;let W=0;const st=at.getAttributes();for(const Z in st)if(st[Z].location>=0){let St=lt[Z];St===void 0&&(Z==="instanceMatrix"&&C.instanceMatrix&&(St=C.instanceMatrix),Z==="instanceColor"&&C.instanceColor&&(St=C.instanceColor));const Ht={};Ht.attribute=St,St&&St.data&&(Ht.data=St.data),_t[Z]=Ht,W++}f.attributes=_t,f.attributesNum=W,f.index=ut}function R(){const C=f.newAttributes;for(let V=0,at=C.length;V<at;V++)C[V]=0}function x(C){v(C,0)}function v(C,V){const at=f.newAttributes,ut=f.enabledAttributes,_t=f.attributeDivisors;at[C]=1,ut[C]===0&&(o.enableVertexAttribArray(C),ut[C]=1),_t[C]!==V&&(o.vertexAttribDivisor(C,V),_t[C]=V)}function z(){const C=f.newAttributes,V=f.enabledAttributes;for(let at=0,ut=V.length;at<ut;at++)V[at]!==C[at]&&(o.disableVertexAttribArray(at),V[at]=0)}function P(C,V,at,ut,_t,lt,W){W===!0?o.vertexAttribIPointer(C,V,at,_t,lt):o.vertexAttribPointer(C,V,at,ut,_t,lt)}function D(C,V,at,ut){R();const _t=ut.attributes,lt=at.getAttributes(),W=V.defaultAttributeValues;for(const st in lt){const Z=lt[st];if(Z.location>=0){let gt=_t[st];if(gt===void 0&&(st==="instanceMatrix"&&C.instanceMatrix&&(gt=C.instanceMatrix),st==="instanceColor"&&C.instanceColor&&(gt=C.instanceColor)),gt!==void 0){const St=gt.normalized,Ht=gt.itemSize,se=e.get(gt);if(se===void 0)continue;const Te=se.buffer,I=se.type,ct=se.bytesPerElement,J=I===o.INT||I===o.UNSIGNED_INT||gt.gpuType===Np;if(gt.isInterleavedBufferAttribute){const it=gt.data,xt=it.stride,Ut=gt.offset;if(it.isInstancedInterleavedBuffer){for(let At=0;At<Z.locationSize;At++)v(Z.location+At,it.meshPerAttribute);C.isInstancedMesh!==!0&&ut._maxInstanceCount===void 0&&(ut._maxInstanceCount=it.meshPerAttribute*it.count)}else for(let At=0;At<Z.locationSize;At++)x(Z.location+At);o.bindBuffer(o.ARRAY_BUFFER,Te);for(let At=0;At<Z.locationSize;At++)P(Z.location+At,Ht/Z.locationSize,I,St,xt*ct,(Ut+Ht/Z.locationSize*At)*ct,J)}else{if(gt.isInstancedBufferAttribute){for(let it=0;it<Z.locationSize;it++)v(Z.location+it,gt.meshPerAttribute);C.isInstancedMesh!==!0&&ut._maxInstanceCount===void 0&&(ut._maxInstanceCount=gt.meshPerAttribute*gt.count)}else for(let it=0;it<Z.locationSize;it++)x(Z.location+it);o.bindBuffer(o.ARRAY_BUFFER,Te);for(let it=0;it<Z.locationSize;it++)P(Z.location+it,Ht/Z.locationSize,I,St,Ht*ct,Ht/Z.locationSize*it*ct,J)}}else if(W!==void 0){const St=W[st];if(St!==void 0)switch(St.length){case 2:o.vertexAttrib2fv(Z.location,St);break;case 3:o.vertexAttrib3fv(Z.location,St);break;case 4:o.vertexAttrib4fv(Z.location,St);break;default:o.vertexAttrib1fv(Z.location,St)}}}}z()}function H(){k();for(const C in r){const V=r[C];for(const at in V){const ut=V[at];for(const _t in ut)S(ut[_t].object),delete ut[_t];delete V[at]}delete r[C]}}function B(C){if(r[C.id]===void 0)return;const V=r[C.id];for(const at in V){const ut=V[at];for(const _t in ut)S(ut[_t].object),delete ut[_t];delete V[at]}delete r[C.id]}function O(C){for(const V in r){const at=r[V];if(at[C.id]===void 0)continue;const ut=at[C.id];for(const _t in ut)S(ut[_t].object),delete ut[_t];delete at[C.id]}}function k(){w(),h=!0,f!==u&&(f=u,_(f.object))}function w(){u.geometry=null,u.program=null,u.wireframe=!1}return{setup:d,reset:k,resetDefaultState:w,dispose:H,releaseStatesOfGeometry:B,releaseStatesOfProgram:O,initAttributes:R,enableAttribute:x,disableUnusedAttributes:z}}function f1(o,e,i){let r;function u(_){r=_}function f(_,S){o.drawArrays(r,_,S),i.update(S,r,1)}function h(_,S,m){m!==0&&(o.drawArraysInstanced(r,_,S,m),i.update(S,r,m))}function d(_,S,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,_,0,S,0,m);let M=0;for(let A=0;A<m;A++)M+=S[A];i.update(M,r,1)}function g(_,S,m,y){if(m===0)return;const M=e.get("WEBGL_multi_draw");if(M===null)for(let A=0;A<_.length;A++)h(_[A],S[A],y[A]);else{M.multiDrawArraysInstancedWEBGL(r,_,0,S,0,y,0,m);let A=0;for(let R=0;R<m;R++)A+=S[R]*y[R];i.update(A,r,1)}}this.setMode=u,this.render=f,this.renderInstances=h,this.renderMultiDraw=d,this.renderMultiDrawInstances=g}function h1(o,e,i,r){let u;function f(){if(u!==void 0)return u;if(e.has("EXT_texture_filter_anisotropic")===!0){const O=e.get("EXT_texture_filter_anisotropic");u=o.getParameter(O.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else u=0;return u}function h(O){return!(O!==Li&&r.convert(O)!==o.getParameter(o.IMPLEMENTATION_COLOR_READ_FORMAT))}function d(O){const k=O===Sl&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(O!==Ji&&r.convert(O)!==o.getParameter(o.IMPLEMENTATION_COLOR_READ_TYPE)&&O!==Zi&&!k)}function g(O){if(O==="highp"){if(o.getShaderPrecisionFormat(o.VERTEX_SHADER,o.HIGH_FLOAT).precision>0&&o.getShaderPrecisionFormat(o.FRAGMENT_SHADER,o.HIGH_FLOAT).precision>0)return"highp";O="mediump"}return O==="mediump"&&o.getShaderPrecisionFormat(o.VERTEX_SHADER,o.MEDIUM_FLOAT).precision>0&&o.getShaderPrecisionFormat(o.FRAGMENT_SHADER,o.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let _=i.precision!==void 0?i.precision:"highp";const S=g(_);S!==_&&(console.warn("THREE.WebGLRenderer:",_,"not supported, using",S,"instead."),_=S);const m=i.logarithmicDepthBuffer===!0,y=i.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),M=o.getParameter(o.MAX_TEXTURE_IMAGE_UNITS),A=o.getParameter(o.MAX_VERTEX_TEXTURE_IMAGE_UNITS),R=o.getParameter(o.MAX_TEXTURE_SIZE),x=o.getParameter(o.MAX_CUBE_MAP_TEXTURE_SIZE),v=o.getParameter(o.MAX_VERTEX_ATTRIBS),z=o.getParameter(o.MAX_VERTEX_UNIFORM_VECTORS),P=o.getParameter(o.MAX_VARYING_VECTORS),D=o.getParameter(o.MAX_FRAGMENT_UNIFORM_VECTORS),H=A>0,B=o.getParameter(o.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:f,getMaxPrecision:g,textureFormatReadable:h,textureTypeReadable:d,precision:_,logarithmicDepthBuffer:m,reversedDepthBuffer:y,maxTextures:M,maxVertexTextures:A,maxTextureSize:R,maxCubemapSize:x,maxAttributes:v,maxVertexUniforms:z,maxVaryings:P,maxFragmentUniforms:D,vertexTextures:H,maxSamples:B}}function d1(o){const e=this;let i=null,r=0,u=!1,f=!1;const h=new as,d=new de,g={value:null,needsUpdate:!1};this.uniform=g,this.numPlanes=0,this.numIntersection=0,this.init=function(m,y){const M=m.length!==0||y||r!==0||u;return u=y,r=m.length,M},this.beginShadows=function(){f=!0,S(null)},this.endShadows=function(){f=!1},this.setGlobalState=function(m,y){i=S(m,y,0)},this.setState=function(m,y,M){const A=m.clippingPlanes,R=m.clipIntersection,x=m.clipShadows,v=o.get(m);if(!u||A===null||A.length===0||f&&!x)f?S(null):_();else{const z=f?0:r,P=z*4;let D=v.clippingState||null;g.value=D,D=S(A,y,P,M);for(let H=0;H!==P;++H)D[H]=i[H];v.clippingState=D,this.numIntersection=R?this.numPlanes:0,this.numPlanes+=z}};function _(){g.value!==i&&(g.value=i,g.needsUpdate=r>0),e.numPlanes=r,e.numIntersection=0}function S(m,y,M,A){const R=m!==null?m.length:0;let x=null;if(R!==0){if(x=g.value,A!==!0||x===null){const v=M+R*4,z=y.matrixWorldInverse;d.getNormalMatrix(z),(x===null||x.length<v)&&(x=new Float32Array(v));for(let P=0,D=M;P!==R;++P,D+=4)h.copy(m[P]).applyMatrix4(z,d),h.normal.toArray(x,D),x[D+3]=h.constant}g.value=x,g.needsUpdate=!0}return e.numPlanes=R,e.numIntersection=0,x}}function p1(o){let e=new WeakMap;function i(h,d){return d===Zd?h.mapping=so:d===Kd&&(h.mapping=ro),h}function r(h){if(h&&h.isTexture){const d=h.mapping;if(d===Zd||d===Kd)if(e.has(h)){const g=e.get(h).texture;return i(g,h.mapping)}else{const g=h.image;if(g&&g.height>0){const _=new lT(g.height);return _.fromEquirectangularTexture(o,h),e.set(h,_),h.addEventListener("dispose",u),i(_.texture,h.mapping)}else return null}}return h}function u(h){const d=h.target;d.removeEventListener("dispose",u);const g=e.get(d);g!==void 0&&(e.delete(d),g.dispose())}function f(){e=new WeakMap}return{get:r,dispose:f}}const to=4,Vv=[.125,.215,.35,.446,.526,.582],Xs=20,Nd=new IS,Xv=new De;let Ld=null,Od=0,Pd=0,zd=!1;const Gs=(1+Math.sqrt(5))/2,Qr=1/Gs,kv=[new nt(-Gs,Qr,0),new nt(Gs,Qr,0),new nt(-Qr,0,Gs),new nt(Qr,0,Gs),new nt(0,Gs,-Qr),new nt(0,Gs,Qr),new nt(-1,1,-1),new nt(1,1,-1),new nt(-1,1,1),new nt(1,1,1)],m1=new nt;class Yv{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,i=0,r=.1,u=100,f={}){const{size:h=256,position:d=m1}=f;Ld=this._renderer.getRenderTarget(),Od=this._renderer.getActiveCubeFace(),Pd=this._renderer.getActiveMipmapLevel(),zd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(h);const g=this._allocateTargets();return g.depthBuffer=!0,this._sceneToCubeUV(e,r,u,g,d),i>0&&this._blur(g,0,0,i),this._applyPMREM(g),this._cleanup(g),g}fromEquirectangular(e,i=null){return this._fromTexture(e,i)}fromCubemap(e,i=null){return this._fromTexture(e,i)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=jv(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Wv(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ld,Od,Pd),this._renderer.xr.enabled=zd,e.scissorTest=!1,dc(e,0,0,e.width,e.height)}_fromTexture(e,i){e.mapping===so||e.mapping===ro?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ld=this._renderer.getRenderTarget(),Od=this._renderer.getActiveCubeFace(),Pd=this._renderer.getActiveMipmapLevel(),zd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const r=i||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),i=4*this._cubeSize,r={magFilter:ji,minFilter:ji,generateMipmaps:!1,type:Sl,format:Li,colorSpace:oo,depthBuffer:!1},u=qv(e,i,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==i){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=qv(e,i,r);const{_lodMax:f}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=_1(f)),this._blurMaterial=g1(f,e,i)}return u}_compileMaterial(e){const i=new Mi(this._lodPlanes[0],e);this._renderer.compile(i,Nd)}_sceneToCubeUV(e,i,r,u,f){const g=new xi(90,1,i,r),_=[1,-1,1,1,1,1],S=[1,1,1,-1,-1,-1],m=this._renderer,y=m.autoClear,M=m.toneMapping;m.getClearColor(Xv),m.toneMapping=os,m.autoClear=!1,m.state.buffers.depth.getReversed()&&(m.setRenderTarget(u),m.clearDepth(),m.setRenderTarget(null));const R=new Xp({name:"PMREM.Background",side:Kn,depthWrite:!1,depthTest:!1}),x=new Mi(new Ml,R);let v=!1;const z=e.background;z?z.isColor&&(R.color.copy(z),e.background=null,v=!0):(R.color.copy(Xv),v=!0);for(let P=0;P<6;P++){const D=P%3;D===0?(g.up.set(0,_[P],0),g.position.set(f.x,f.y,f.z),g.lookAt(f.x+S[P],f.y,f.z)):D===1?(g.up.set(0,0,_[P]),g.position.set(f.x,f.y,f.z),g.lookAt(f.x,f.y+S[P],f.z)):(g.up.set(0,_[P],0),g.position.set(f.x,f.y,f.z),g.lookAt(f.x,f.y,f.z+S[P]));const H=this._cubeSize;dc(u,D*H,P>2?H:0,H,H),m.setRenderTarget(u),v&&m.render(x,g),m.render(e,g)}x.geometry.dispose(),x.material.dispose(),m.toneMapping=M,m.autoClear=y,e.background=z}_textureToCubeUV(e,i){const r=this._renderer,u=e.mapping===so||e.mapping===ro;u?(this._cubemapMaterial===null&&(this._cubemapMaterial=jv()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Wv());const f=u?this._cubemapMaterial:this._equirectMaterial,h=new Mi(this._lodPlanes[0],f),d=f.uniforms;d.envMap.value=e;const g=this._cubeSize;dc(i,0,0,3*g,2*g),r.setRenderTarget(i),r.render(h,Nd)}_applyPMREM(e){const i=this._renderer,r=i.autoClear;i.autoClear=!1;const u=this._lodPlanes.length;for(let f=1;f<u;f++){const h=Math.sqrt(this._sigmas[f]*this._sigmas[f]-this._sigmas[f-1]*this._sigmas[f-1]),d=kv[(u-f-1)%kv.length];this._blur(e,f-1,f,h,d)}i.autoClear=r}_blur(e,i,r,u,f){const h=this._pingPongRenderTarget;this._halfBlur(e,h,i,r,u,"latitudinal",f),this._halfBlur(h,e,r,r,u,"longitudinal",f)}_halfBlur(e,i,r,u,f,h,d){const g=this._renderer,_=this._blurMaterial;h!=="latitudinal"&&h!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const S=3,m=new Mi(this._lodPlanes[u],_),y=_.uniforms,M=this._sizeLods[r]-1,A=isFinite(f)?Math.PI/(2*M):2*Math.PI/(2*Xs-1),R=f/A,x=isFinite(f)?1+Math.floor(S*R):Xs;x>Xs&&console.warn(`sigmaRadians, ${f}, is too large and will clip, as it requested ${x} samples when the maximum is set to ${Xs}`);const v=[];let z=0;for(let O=0;O<Xs;++O){const k=O/R,w=Math.exp(-k*k/2);v.push(w),O===0?z+=w:O<x&&(z+=2*w)}for(let O=0;O<v.length;O++)v[O]=v[O]/z;y.envMap.value=e.texture,y.samples.value=x,y.weights.value=v,y.latitudinal.value=h==="latitudinal",d&&(y.poleAxis.value=d);const{_lodMax:P}=this;y.dTheta.value=A,y.mipInt.value=P-r;const D=this._sizeLods[u],H=3*D*(u>P-to?u-P+to:0),B=4*(this._cubeSize-D);dc(i,H,B,3*D,2*D),g.setRenderTarget(i),g.render(m,Nd)}}function _1(o){const e=[],i=[],r=[];let u=o;const f=o-to+1+Vv.length;for(let h=0;h<f;h++){const d=Math.pow(2,u);i.push(d);let g=1/d;h>o-to?g=Vv[h-o+to-1]:h===0&&(g=0),r.push(g);const _=1/(d-2),S=-_,m=1+_,y=[S,S,m,S,m,m,S,S,m,m,S,m],M=6,A=6,R=3,x=2,v=1,z=new Float32Array(R*A*M),P=new Float32Array(x*A*M),D=new Float32Array(v*A*M);for(let B=0;B<M;B++){const O=B%3*2/3-1,k=B>2?0:-1,w=[O,k,0,O+2/3,k,0,O+2/3,k+1,0,O,k,0,O+2/3,k+1,0,O,k+1,0];z.set(w,R*A*B),P.set(y,x*A*B);const C=[B,B,B,B,B,B];D.set(C,v*A*B)}const H=new cs;H.setAttribute("position",new Oi(z,R)),H.setAttribute("uv",new Oi(P,x)),H.setAttribute("faceIndex",new Oi(D,v)),e.push(H),u>to&&u--}return{lodPlanes:e,sizeLods:i,sigmas:r}}function qv(o,e,i){const r=new js(o,e,i);return r.texture.mapping=Ac,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function dc(o,e,i,r,u){o.viewport.set(e,i,r,u),o.scissor.set(e,i,r,u)}function g1(o,e,i){const r=new Float32Array(Xs),u=new nt(0,1,0);return new us({name:"SphericalGaussianBlur",defines:{n:Xs,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/i,CUBEUV_MAX_MIP:`${o}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:u}},vertexShader:Yp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:rs,depthTest:!1,depthWrite:!1})}function Wv(){return new us({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Yp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:rs,depthTest:!1,depthWrite:!1})}function jv(){return new us({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Yp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:rs,depthTest:!1,depthWrite:!1})}function Yp(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function v1(o){let e=new WeakMap,i=null;function r(d){if(d&&d.isTexture){const g=d.mapping,_=g===Zd||g===Kd,S=g===so||g===ro;if(_||S){let m=e.get(d);const y=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==y)return i===null&&(i=new Yv(o)),m=_?i.fromEquirectangular(d,m):i.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),m.texture;if(m!==void 0)return m.texture;{const M=d.image;return _&&M&&M.height>0||S&&M&&u(M)?(i===null&&(i=new Yv(o)),m=_?i.fromEquirectangular(d):i.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),d.addEventListener("dispose",f),m.texture):null}}}return d}function u(d){let g=0;const _=6;for(let S=0;S<_;S++)d[S]!==void 0&&g++;return g===_}function f(d){const g=d.target;g.removeEventListener("dispose",f);const _=e.get(g);_!==void 0&&(e.delete(g),_.dispose())}function h(){e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:r,dispose:h}}function S1(o){const e={};function i(r){if(e[r]!==void 0)return e[r];let u;switch(r){case"WEBGL_depth_texture":u=o.getExtension("WEBGL_depth_texture")||o.getExtension("MOZ_WEBGL_depth_texture")||o.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":u=o.getExtension("EXT_texture_filter_anisotropic")||o.getExtension("MOZ_EXT_texture_filter_anisotropic")||o.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":u=o.getExtension("WEBGL_compressed_texture_s3tc")||o.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||o.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":u=o.getExtension("WEBGL_compressed_texture_pvrtc")||o.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:u=o.getExtension(r)}return e[r]=u,u}return{has:function(r){return i(r)!==null},init:function(){i("EXT_color_buffer_float"),i("WEBGL_clip_cull_distance"),i("OES_texture_float_linear"),i("EXT_color_buffer_half_float"),i("WEBGL_multisampled_render_to_texture"),i("WEBGL_render_shared_exponent")},get:function(r){const u=i(r);return u===null&&vl("THREE.WebGLRenderer: "+r+" extension not supported."),u}}}function y1(o,e,i,r){const u={},f=new WeakMap;function h(m){const y=m.target;y.index!==null&&e.remove(y.index);for(const A in y.attributes)e.remove(y.attributes[A]);y.removeEventListener("dispose",h),delete u[y.id];const M=f.get(y);M&&(e.remove(M),f.delete(y)),r.releaseStatesOfGeometry(y),y.isInstancedBufferGeometry===!0&&delete y._maxInstanceCount,i.memory.geometries--}function d(m,y){return u[y.id]===!0||(y.addEventListener("dispose",h),u[y.id]=!0,i.memory.geometries++),y}function g(m){const y=m.attributes;for(const M in y)e.update(y[M],o.ARRAY_BUFFER)}function _(m){const y=[],M=m.index,A=m.attributes.position;let R=0;if(M!==null){const z=M.array;R=M.version;for(let P=0,D=z.length;P<D;P+=3){const H=z[P+0],B=z[P+1],O=z[P+2];y.push(H,B,B,O,O,H)}}else if(A!==void 0){const z=A.array;R=A.version;for(let P=0,D=z.length/3-1;P<D;P+=3){const H=P+0,B=P+1,O=P+2;y.push(H,B,B,O,O,H)}}else return;const x=new(AS(y)?DS:wS)(y,1);x.version=R;const v=f.get(m);v&&e.remove(v),f.set(m,x)}function S(m){const y=f.get(m);if(y){const M=m.index;M!==null&&y.version<M.version&&_(m)}else _(m);return f.get(m)}return{get:d,update:g,getWireframeAttribute:S}}function x1(o,e,i){let r;function u(y){r=y}let f,h;function d(y){f=y.type,h=y.bytesPerElement}function g(y,M){o.drawElements(r,M,f,y*h),i.update(M,r,1)}function _(y,M,A){A!==0&&(o.drawElementsInstanced(r,M,f,y*h,A),i.update(M,r,A))}function S(y,M,A){if(A===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,M,0,f,y,0,A);let x=0;for(let v=0;v<A;v++)x+=M[v];i.update(x,r,1)}function m(y,M,A,R){if(A===0)return;const x=e.get("WEBGL_multi_draw");if(x===null)for(let v=0;v<y.length;v++)_(y[v]/h,M[v],R[v]);else{x.multiDrawElementsInstancedWEBGL(r,M,0,f,y,0,R,0,A);let v=0;for(let z=0;z<A;z++)v+=M[z]*R[z];i.update(v,r,1)}}this.setMode=u,this.setIndex=d,this.render=g,this.renderInstances=_,this.renderMultiDraw=S,this.renderMultiDrawInstances=m}function M1(o){const e={geometries:0,textures:0},i={frame:0,calls:0,triangles:0,points:0,lines:0};function r(f,h,d){switch(i.calls++,h){case o.TRIANGLES:i.triangles+=d*(f/3);break;case o.LINES:i.lines+=d*(f/2);break;case o.LINE_STRIP:i.lines+=d*(f-1);break;case o.LINE_LOOP:i.lines+=d*f;break;case o.POINTS:i.points+=d*f;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",h);break}}function u(){i.calls=0,i.triangles=0,i.points=0,i.lines=0}return{memory:e,render:i,programs:null,autoReset:!0,reset:u,update:r}}function E1(o,e,i){const r=new WeakMap,u=new sn;function f(h,d,g){const _=h.morphTargetInfluences,S=d.morphAttributes.position||d.morphAttributes.normal||d.morphAttributes.color,m=S!==void 0?S.length:0;let y=r.get(d);if(y===void 0||y.count!==m){let C=function(){k.dispose(),r.delete(d),d.removeEventListener("dispose",C)};var M=C;y!==void 0&&y.texture.dispose();const A=d.morphAttributes.position!==void 0,R=d.morphAttributes.normal!==void 0,x=d.morphAttributes.color!==void 0,v=d.morphAttributes.position||[],z=d.morphAttributes.normal||[],P=d.morphAttributes.color||[];let D=0;A===!0&&(D=1),R===!0&&(D=2),x===!0&&(D=3);let H=d.attributes.position.count*D,B=1;H>e.maxTextureSize&&(B=Math.ceil(H/e.maxTextureSize),H=e.maxTextureSize);const O=new Float32Array(H*B*4*m),k=new RS(O,H,B,m);k.type=Zi,k.needsUpdate=!0;const w=D*4;for(let V=0;V<m;V++){const at=v[V],ut=z[V],_t=P[V],lt=H*B*4*V;for(let W=0;W<at.count;W++){const st=W*w;A===!0&&(u.fromBufferAttribute(at,W),O[lt+st+0]=u.x,O[lt+st+1]=u.y,O[lt+st+2]=u.z,O[lt+st+3]=0),R===!0&&(u.fromBufferAttribute(ut,W),O[lt+st+4]=u.x,O[lt+st+5]=u.y,O[lt+st+6]=u.z,O[lt+st+7]=0),x===!0&&(u.fromBufferAttribute(_t,W),O[lt+st+8]=u.x,O[lt+st+9]=u.y,O[lt+st+10]=u.z,O[lt+st+11]=_t.itemSize===4?u.w:1)}}y={count:m,texture:k,size:new ce(H,B)},r.set(d,y),d.addEventListener("dispose",C)}if(h.isInstancedMesh===!0&&h.morphTexture!==null)g.getUniforms().setValue(o,"morphTexture",h.morphTexture,i);else{let A=0;for(let x=0;x<_.length;x++)A+=_[x];const R=d.morphTargetsRelative?1:1-A;g.getUniforms().setValue(o,"morphTargetBaseInfluence",R),g.getUniforms().setValue(o,"morphTargetInfluences",_)}g.getUniforms().setValue(o,"morphTargetsTexture",y.texture,i),g.getUniforms().setValue(o,"morphTargetsTextureSize",y.size)}return{update:f}}function T1(o,e,i,r){let u=new WeakMap;function f(g){const _=r.render.frame,S=g.geometry,m=e.get(g,S);if(u.get(m)!==_&&(e.update(m),u.set(m,_)),g.isInstancedMesh&&(g.hasEventListener("dispose",d)===!1&&g.addEventListener("dispose",d),u.get(g)!==_&&(i.update(g.instanceMatrix,o.ARRAY_BUFFER),g.instanceColor!==null&&i.update(g.instanceColor,o.ARRAY_BUFFER),u.set(g,_))),g.isSkinnedMesh){const y=g.skeleton;u.get(y)!==_&&(y.update(),u.set(y,_))}return m}function h(){u=new WeakMap}function d(g){const _=g.target;_.removeEventListener("dispose",d),i.remove(_.instanceMatrix),_.instanceColor!==null&&i.remove(_.instanceColor)}return{update:f,dispose:h}}const FS=new Xn,Zv=new OS(1,1),HS=new RS,GS=new YE,VS=new LS,Kv=[],Qv=[],Jv=new Float32Array(16),$v=new Float32Array(9),tS=new Float32Array(4);function co(o,e,i){const r=o[0];if(r<=0||r>0)return o;const u=e*i;let f=Kv[u];if(f===void 0&&(f=new Float32Array(u),Kv[u]=f),e!==0){r.toArray(f,0);for(let h=1,d=0;h!==e;++h)d+=i,o[h].toArray(f,d)}return f}function vn(o,e){if(o.length!==e.length)return!1;for(let i=0,r=o.length;i<r;i++)if(o[i]!==e[i])return!1;return!0}function Sn(o,e){for(let i=0,r=e.length;i<r;i++)o[i]=e[i]}function Cc(o,e){let i=Qv[e];i===void 0&&(i=new Int32Array(e),Qv[e]=i);for(let r=0;r!==e;++r)i[r]=o.allocateTextureUnit();return i}function b1(o,e){const i=this.cache;i[0]!==e&&(o.uniform1f(this.addr,e),i[0]=e)}function A1(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y)&&(o.uniform2f(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y);else{if(vn(i,e))return;o.uniform2fv(this.addr,e),Sn(i,e)}}function R1(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)&&(o.uniform3f(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z);else if(e.r!==void 0)(i[0]!==e.r||i[1]!==e.g||i[2]!==e.b)&&(o.uniform3f(this.addr,e.r,e.g,e.b),i[0]=e.r,i[1]=e.g,i[2]=e.b);else{if(vn(i,e))return;o.uniform3fv(this.addr,e),Sn(i,e)}}function C1(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)&&(o.uniform4f(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w);else{if(vn(i,e))return;o.uniform4fv(this.addr,e),Sn(i,e)}}function w1(o,e){const i=this.cache,r=e.elements;if(r===void 0){if(vn(i,e))return;o.uniformMatrix2fv(this.addr,!1,e),Sn(i,e)}else{if(vn(i,r))return;tS.set(r),o.uniformMatrix2fv(this.addr,!1,tS),Sn(i,r)}}function D1(o,e){const i=this.cache,r=e.elements;if(r===void 0){if(vn(i,e))return;o.uniformMatrix3fv(this.addr,!1,e),Sn(i,e)}else{if(vn(i,r))return;$v.set(r),o.uniformMatrix3fv(this.addr,!1,$v),Sn(i,r)}}function U1(o,e){const i=this.cache,r=e.elements;if(r===void 0){if(vn(i,e))return;o.uniformMatrix4fv(this.addr,!1,e),Sn(i,e)}else{if(vn(i,r))return;Jv.set(r),o.uniformMatrix4fv(this.addr,!1,Jv),Sn(i,r)}}function N1(o,e){const i=this.cache;i[0]!==e&&(o.uniform1i(this.addr,e),i[0]=e)}function L1(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y)&&(o.uniform2i(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y);else{if(vn(i,e))return;o.uniform2iv(this.addr,e),Sn(i,e)}}function O1(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)&&(o.uniform3i(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z);else{if(vn(i,e))return;o.uniform3iv(this.addr,e),Sn(i,e)}}function P1(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)&&(o.uniform4i(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w);else{if(vn(i,e))return;o.uniform4iv(this.addr,e),Sn(i,e)}}function z1(o,e){const i=this.cache;i[0]!==e&&(o.uniform1ui(this.addr,e),i[0]=e)}function I1(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y)&&(o.uniform2ui(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y);else{if(vn(i,e))return;o.uniform2uiv(this.addr,e),Sn(i,e)}}function B1(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)&&(o.uniform3ui(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z);else{if(vn(i,e))return;o.uniform3uiv(this.addr,e),Sn(i,e)}}function F1(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)&&(o.uniform4ui(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w);else{if(vn(i,e))return;o.uniform4uiv(this.addr,e),Sn(i,e)}}function H1(o,e,i){const r=this.cache,u=i.allocateTextureUnit();r[0]!==u&&(o.uniform1i(this.addr,u),r[0]=u);let f;this.type===o.SAMPLER_2D_SHADOW?(Zv.compareFunction=bS,f=Zv):f=FS,i.setTexture2D(e||f,u)}function G1(o,e,i){const r=this.cache,u=i.allocateTextureUnit();r[0]!==u&&(o.uniform1i(this.addr,u),r[0]=u),i.setTexture3D(e||GS,u)}function V1(o,e,i){const r=this.cache,u=i.allocateTextureUnit();r[0]!==u&&(o.uniform1i(this.addr,u),r[0]=u),i.setTextureCube(e||VS,u)}function X1(o,e,i){const r=this.cache,u=i.allocateTextureUnit();r[0]!==u&&(o.uniform1i(this.addr,u),r[0]=u),i.setTexture2DArray(e||HS,u)}function k1(o){switch(o){case 5126:return b1;case 35664:return A1;case 35665:return R1;case 35666:return C1;case 35674:return w1;case 35675:return D1;case 35676:return U1;case 5124:case 35670:return N1;case 35667:case 35671:return L1;case 35668:case 35672:return O1;case 35669:case 35673:return P1;case 5125:return z1;case 36294:return I1;case 36295:return B1;case 36296:return F1;case 35678:case 36198:case 36298:case 36306:case 35682:return H1;case 35679:case 36299:case 36307:return G1;case 35680:case 36300:case 36308:case 36293:return V1;case 36289:case 36303:case 36311:case 36292:return X1}}function Y1(o,e){o.uniform1fv(this.addr,e)}function q1(o,e){const i=co(e,this.size,2);o.uniform2fv(this.addr,i)}function W1(o,e){const i=co(e,this.size,3);o.uniform3fv(this.addr,i)}function j1(o,e){const i=co(e,this.size,4);o.uniform4fv(this.addr,i)}function Z1(o,e){const i=co(e,this.size,4);o.uniformMatrix2fv(this.addr,!1,i)}function K1(o,e){const i=co(e,this.size,9);o.uniformMatrix3fv(this.addr,!1,i)}function Q1(o,e){const i=co(e,this.size,16);o.uniformMatrix4fv(this.addr,!1,i)}function J1(o,e){o.uniform1iv(this.addr,e)}function $1(o,e){o.uniform2iv(this.addr,e)}function tR(o,e){o.uniform3iv(this.addr,e)}function eR(o,e){o.uniform4iv(this.addr,e)}function nR(o,e){o.uniform1uiv(this.addr,e)}function iR(o,e){o.uniform2uiv(this.addr,e)}function aR(o,e){o.uniform3uiv(this.addr,e)}function sR(o,e){o.uniform4uiv(this.addr,e)}function rR(o,e,i){const r=this.cache,u=e.length,f=Cc(i,u);vn(r,f)||(o.uniform1iv(this.addr,f),Sn(r,f));for(let h=0;h!==u;++h)i.setTexture2D(e[h]||FS,f[h])}function oR(o,e,i){const r=this.cache,u=e.length,f=Cc(i,u);vn(r,f)||(o.uniform1iv(this.addr,f),Sn(r,f));for(let h=0;h!==u;++h)i.setTexture3D(e[h]||GS,f[h])}function lR(o,e,i){const r=this.cache,u=e.length,f=Cc(i,u);vn(r,f)||(o.uniform1iv(this.addr,f),Sn(r,f));for(let h=0;h!==u;++h)i.setTextureCube(e[h]||VS,f[h])}function uR(o,e,i){const r=this.cache,u=e.length,f=Cc(i,u);vn(r,f)||(o.uniform1iv(this.addr,f),Sn(r,f));for(let h=0;h!==u;++h)i.setTexture2DArray(e[h]||HS,f[h])}function cR(o){switch(o){case 5126:return Y1;case 35664:return q1;case 35665:return W1;case 35666:return j1;case 35674:return Z1;case 35675:return K1;case 35676:return Q1;case 5124:case 35670:return J1;case 35667:case 35671:return $1;case 35668:case 35672:return tR;case 35669:case 35673:return eR;case 5125:return nR;case 36294:return iR;case 36295:return aR;case 36296:return sR;case 35678:case 36198:case 36298:case 36306:case 35682:return rR;case 35679:case 36299:case 36307:return oR;case 35680:case 36300:case 36308:case 36293:return lR;case 36289:case 36303:case 36311:case 36292:return uR}}class fR{constructor(e,i,r){this.id=e,this.addr=r,this.cache=[],this.type=i.type,this.setValue=k1(i.type)}}class hR{constructor(e,i,r){this.id=e,this.addr=r,this.cache=[],this.type=i.type,this.size=i.size,this.setValue=cR(i.type)}}class dR{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,i,r){const u=this.seq;for(let f=0,h=u.length;f!==h;++f){const d=u[f];d.setValue(e,i[d.id],r)}}}const Id=/(\w+)(\])?(\[|\.)?/g;function eS(o,e){o.seq.push(e),o.map[e.id]=e}function pR(o,e,i){const r=o.name,u=r.length;for(Id.lastIndex=0;;){const f=Id.exec(r),h=Id.lastIndex;let d=f[1];const g=f[2]==="]",_=f[3];if(g&&(d=d|0),_===void 0||_==="["&&h+2===u){eS(i,_===void 0?new fR(d,o,e):new hR(d,o,e));break}else{let m=i.map[d];m===void 0&&(m=new dR(d),eS(i,m)),i=m}}}class yc{constructor(e,i){this.seq=[],this.map={};const r=e.getProgramParameter(i,e.ACTIVE_UNIFORMS);for(let u=0;u<r;++u){const f=e.getActiveUniform(i,u),h=e.getUniformLocation(i,f.name);pR(f,h,this)}}setValue(e,i,r,u){const f=this.map[i];f!==void 0&&f.setValue(e,r,u)}setOptional(e,i,r){const u=i[r];u!==void 0&&this.setValue(e,r,u)}static upload(e,i,r,u){for(let f=0,h=i.length;f!==h;++f){const d=i[f],g=r[d.id];g.needsUpdate!==!1&&d.setValue(e,g.value,u)}}static seqWithValue(e,i){const r=[];for(let u=0,f=e.length;u!==f;++u){const h=e[u];h.id in i&&r.push(h)}return r}}function nS(o,e,i){const r=o.createShader(e);return o.shaderSource(r,i),o.compileShader(r),r}const mR=37297;let _R=0;function gR(o,e){const i=o.split(`
`),r=[],u=Math.max(e-6,0),f=Math.min(e+6,i.length);for(let h=u;h<f;h++){const d=h+1;r.push(`${d===e?">":" "} ${d}: ${i[h]}`)}return r.join(`
`)}const iS=new de;function vR(o){we._getMatrix(iS,we.workingColorSpace,o);const e=`mat3( ${iS.elements.map(i=>i.toFixed(4))} )`;switch(we.getTransfer(o)){case Mc:return[e,"LinearTransferOETF"];case Ve:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",o),[e,"LinearTransferOETF"]}}function aS(o,e,i){const r=o.getShaderParameter(e,o.COMPILE_STATUS),f=(o.getShaderInfoLog(e)||"").trim();if(r&&f==="")return"";const h=/ERROR: 0:(\d+)/.exec(f);if(h){const d=parseInt(h[1]);return i.toUpperCase()+`

`+f+`

`+gR(o.getShaderSource(e),d)}else return f}function SR(o,e){const i=vR(e);return[`vec4 ${o}( vec4 value ) {`,`	return ${i[1]}( vec4( value.rgb * ${i[0]}, value.a ) );`,"}"].join(`
`)}function yR(o,e){let i;switch(e){case aE:i="Linear";break;case sE:i="Reinhard";break;case rE:i="Cineon";break;case oE:i="ACESFilmic";break;case uE:i="AgX";break;case cE:i="Neutral";break;case lE:i="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),i="Linear"}return"vec3 "+o+"( vec3 color ) { return "+i+"ToneMapping( color ); }"}const pc=new nt;function xR(){we.getLuminanceCoefficients(pc);const o=pc.x.toFixed(4),e=pc.y.toFixed(4),i=pc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${o}, ${e}, ${i} );`,"	return dot( weights, rgb );","}"].join(`
`)}function MR(o){return[o.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",o.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(cl).join(`
`)}function ER(o){const e=[];for(const i in o){const r=o[i];r!==!1&&e.push("#define "+i+" "+r)}return e.join(`
`)}function TR(o,e){const i={},r=o.getProgramParameter(e,o.ACTIVE_ATTRIBUTES);for(let u=0;u<r;u++){const f=o.getActiveAttrib(e,u),h=f.name;let d=1;f.type===o.FLOAT_MAT2&&(d=2),f.type===o.FLOAT_MAT3&&(d=3),f.type===o.FLOAT_MAT4&&(d=4),i[h]={type:f.type,location:o.getAttribLocation(e,h),locationSize:d}}return i}function cl(o){return o!==""}function sS(o,e){const i=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return o.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,i).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function rS(o,e){return o.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const bR=/^[ \t]*#include +<([\w\d./]+)>/gm;function wp(o){return o.replace(bR,RR)}const AR=new Map;function RR(o,e){let i=pe[e];if(i===void 0){const r=AR.get(e);if(r!==void 0)i=pe[r],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,r);else throw new Error("Can not resolve #include <"+e+">")}return wp(i)}const CR=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function oS(o){return o.replace(CR,wR)}function wR(o,e,i,r){let u="";for(let f=parseInt(e);f<parseInt(i);f++)u+=r.replace(/\[\s*i\s*\]/g,"[ "+f+" ]").replace(/UNROLLED_LOOP_INDEX/g,f);return u}function lS(o){let e=`precision ${o.precision} float;
	precision ${o.precision} int;
	precision ${o.precision} sampler2D;
	precision ${o.precision} samplerCube;
	precision ${o.precision} sampler3D;
	precision ${o.precision} sampler2DArray;
	precision ${o.precision} sampler2DShadow;
	precision ${o.precision} samplerCubeShadow;
	precision ${o.precision} sampler2DArrayShadow;
	precision ${o.precision} isampler2D;
	precision ${o.precision} isampler3D;
	precision ${o.precision} isamplerCube;
	precision ${o.precision} isampler2DArray;
	precision ${o.precision} usampler2D;
	precision ${o.precision} usampler3D;
	precision ${o.precision} usamplerCube;
	precision ${o.precision} usampler2DArray;
	`;return o.precision==="highp"?e+=`
#define HIGH_PRECISION`:o.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:o.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function DR(o){let e="SHADOWMAP_TYPE_BASIC";return o.shadowMapType===pS?e="SHADOWMAP_TYPE_PCF":o.shadowMapType===IM?e="SHADOWMAP_TYPE_PCF_SOFT":o.shadowMapType===xa&&(e="SHADOWMAP_TYPE_VSM"),e}function UR(o){let e="ENVMAP_TYPE_CUBE";if(o.envMap)switch(o.envMapMode){case so:case ro:e="ENVMAP_TYPE_CUBE";break;case Ac:e="ENVMAP_TYPE_CUBE_UV";break}return e}function NR(o){let e="ENVMAP_MODE_REFLECTION";return o.envMap&&o.envMapMode===ro&&(e="ENVMAP_MODE_REFRACTION"),e}function LR(o){let e="ENVMAP_BLENDING_NONE";if(o.envMap)switch(o.combine){case mS:e="ENVMAP_BLENDING_MULTIPLY";break;case nE:e="ENVMAP_BLENDING_MIX";break;case iE:e="ENVMAP_BLENDING_ADD";break}return e}function OR(o){const e=o.envMapCubeUVHeight;if(e===null)return null;const i=Math.log2(e)-2,r=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,i),112)),texelHeight:r,maxMip:i}}function PR(o,e,i,r){const u=o.getContext(),f=i.defines;let h=i.vertexShader,d=i.fragmentShader;const g=DR(i),_=UR(i),S=NR(i),m=LR(i),y=OR(i),M=MR(i),A=ER(f),R=u.createProgram();let x,v,z=i.glslVersion?"#version "+i.glslVersion+`
`:"";i.isRawShaderMaterial?(x=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,A].filter(cl).join(`
`),x.length>0&&(x+=`
`),v=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,A].filter(cl).join(`
`),v.length>0&&(v+=`
`)):(x=[lS(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,A,i.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",i.batching?"#define USE_BATCHING":"",i.batchingColor?"#define USE_BATCHING_COLOR":"",i.instancing?"#define USE_INSTANCING":"",i.instancingColor?"#define USE_INSTANCING_COLOR":"",i.instancingMorph?"#define USE_INSTANCING_MORPH":"",i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.map?"#define USE_MAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+S:"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.displacementMap?"#define USE_DISPLACEMENTMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.mapUv?"#define MAP_UV "+i.mapUv:"",i.alphaMapUv?"#define ALPHAMAP_UV "+i.alphaMapUv:"",i.lightMapUv?"#define LIGHTMAP_UV "+i.lightMapUv:"",i.aoMapUv?"#define AOMAP_UV "+i.aoMapUv:"",i.emissiveMapUv?"#define EMISSIVEMAP_UV "+i.emissiveMapUv:"",i.bumpMapUv?"#define BUMPMAP_UV "+i.bumpMapUv:"",i.normalMapUv?"#define NORMALMAP_UV "+i.normalMapUv:"",i.displacementMapUv?"#define DISPLACEMENTMAP_UV "+i.displacementMapUv:"",i.metalnessMapUv?"#define METALNESSMAP_UV "+i.metalnessMapUv:"",i.roughnessMapUv?"#define ROUGHNESSMAP_UV "+i.roughnessMapUv:"",i.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+i.anisotropyMapUv:"",i.clearcoatMapUv?"#define CLEARCOATMAP_UV "+i.clearcoatMapUv:"",i.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+i.clearcoatNormalMapUv:"",i.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+i.clearcoatRoughnessMapUv:"",i.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+i.iridescenceMapUv:"",i.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+i.iridescenceThicknessMapUv:"",i.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+i.sheenColorMapUv:"",i.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+i.sheenRoughnessMapUv:"",i.specularMapUv?"#define SPECULARMAP_UV "+i.specularMapUv:"",i.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+i.specularColorMapUv:"",i.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+i.specularIntensityMapUv:"",i.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+i.transmissionMapUv:"",i.thicknessMapUv?"#define THICKNESSMAP_UV "+i.thicknessMapUv:"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.flatShading?"#define FLAT_SHADED":"",i.skinning?"#define USE_SKINNING":"",i.morphTargets?"#define USE_MORPHTARGETS":"",i.morphNormals&&i.flatShading===!1?"#define USE_MORPHNORMALS":"",i.morphColors?"#define USE_MORPHCOLORS":"",i.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+i.morphTextureStride:"",i.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+i.morphTargetsCount:"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+g:"",i.sizeAttenuation?"#define USE_SIZEATTENUATION":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(cl).join(`
`),v=[lS(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,A,i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",i.map?"#define USE_MAP":"",i.matcap?"#define USE_MATCAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+_:"",i.envMap?"#define "+S:"",i.envMap?"#define "+m:"",y?"#define CUBEUV_TEXEL_WIDTH "+y.texelWidth:"",y?"#define CUBEUV_TEXEL_HEIGHT "+y.texelHeight:"",y?"#define CUBEUV_MAX_MIP "+y.maxMip+".0":"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoat?"#define USE_CLEARCOAT":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.dispersion?"#define USE_DISPERSION":"",i.iridescence?"#define USE_IRIDESCENCE":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaTest?"#define USE_ALPHATEST":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.sheen?"#define USE_SHEEN":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors||i.instancingColor||i.batchingColor?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.gradientMap?"#define USE_GRADIENTMAP":"",i.flatShading?"#define FLAT_SHADED":"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+g:"",i.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",i.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",i.toneMapping!==os?"#define TONE_MAPPING":"",i.toneMapping!==os?pe.tonemapping_pars_fragment:"",i.toneMapping!==os?yR("toneMapping",i.toneMapping):"",i.dithering?"#define DITHERING":"",i.opaque?"#define OPAQUE":"",pe.colorspace_pars_fragment,SR("linearToOutputTexel",i.outputColorSpace),xR(),i.useDepthPacking?"#define DEPTH_PACKING "+i.depthPacking:"",`
`].filter(cl).join(`
`)),h=wp(h),h=sS(h,i),h=rS(h,i),d=wp(d),d=sS(d,i),d=rS(d,i),h=oS(h),d=oS(d),i.isRawShaderMaterial!==!0&&(z=`#version 300 es
`,x=[M,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,v=["#define varying in",i.glslVersion===pv?"":"layout(location = 0) out highp vec4 pc_fragColor;",i.glslVersion===pv?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+v);const P=z+x+h,D=z+v+d,H=nS(u,u.VERTEX_SHADER,P),B=nS(u,u.FRAGMENT_SHADER,D);u.attachShader(R,H),u.attachShader(R,B),i.index0AttributeName!==void 0?u.bindAttribLocation(R,0,i.index0AttributeName):i.morphTargets===!0&&u.bindAttribLocation(R,0,"position"),u.linkProgram(R);function O(V){if(o.debug.checkShaderErrors){const at=u.getProgramInfoLog(R)||"",ut=u.getShaderInfoLog(H)||"",_t=u.getShaderInfoLog(B)||"",lt=at.trim(),W=ut.trim(),st=_t.trim();let Z=!0,gt=!0;if(u.getProgramParameter(R,u.LINK_STATUS)===!1)if(Z=!1,typeof o.debug.onShaderError=="function")o.debug.onShaderError(u,R,H,B);else{const St=aS(u,H,"vertex"),Ht=aS(u,B,"fragment");console.error("THREE.WebGLProgram: Shader Error "+u.getError()+" - VALIDATE_STATUS "+u.getProgramParameter(R,u.VALIDATE_STATUS)+`

Material Name: `+V.name+`
Material Type: `+V.type+`

Program Info Log: `+lt+`
`+St+`
`+Ht)}else lt!==""?console.warn("THREE.WebGLProgram: Program Info Log:",lt):(W===""||st==="")&&(gt=!1);gt&&(V.diagnostics={runnable:Z,programLog:lt,vertexShader:{log:W,prefix:x},fragmentShader:{log:st,prefix:v}})}u.deleteShader(H),u.deleteShader(B),k=new yc(u,R),w=TR(u,R)}let k;this.getUniforms=function(){return k===void 0&&O(this),k};let w;this.getAttributes=function(){return w===void 0&&O(this),w};let C=i.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=u.getProgramParameter(R,mR)),C},this.destroy=function(){r.releaseStatesOfProgram(this),u.deleteProgram(R),this.program=void 0},this.type=i.shaderType,this.name=i.shaderName,this.id=_R++,this.cacheKey=e,this.usedTimes=1,this.program=R,this.vertexShader=H,this.fragmentShader=B,this}let zR=0;class IR{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const i=e.vertexShader,r=e.fragmentShader,u=this._getShaderStage(i),f=this._getShaderStage(r),h=this._getShaderCacheForMaterial(e);return h.has(u)===!1&&(h.add(u),u.usedTimes++),h.has(f)===!1&&(h.add(f),f.usedTimes++),this}remove(e){const i=this.materialCache.get(e);for(const r of i)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const i=this.materialCache;let r=i.get(e);return r===void 0&&(r=new Set,i.set(e,r)),r}_getShaderStage(e){const i=this.shaderCache;let r=i.get(e);return r===void 0&&(r=new BR(e),i.set(e,r)),r}}class BR{constructor(e){this.id=zR++,this.code=e,this.usedTimes=0}}function FR(o,e,i,r,u,f,h){const d=new Vp,g=new IR,_=new Set,S=[],m=u.logarithmicDepthBuffer,y=u.vertexTextures;let M=u.precision;const A={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function R(w){return _.add(w),w===0?"uv":`uv${w}`}function x(w,C,V,at,ut){const _t=at.fog,lt=ut.geometry,W=w.isMeshStandardMaterial?at.environment:null,st=(w.isMeshStandardMaterial?i:e).get(w.envMap||W),Z=st&&st.mapping===Ac?st.image.height:null,gt=A[w.type];w.precision!==null&&(M=u.getMaxPrecision(w.precision),M!==w.precision&&console.warn("THREE.WebGLProgram.getParameters:",w.precision,"not supported, using",M,"instead."));const St=lt.morphAttributes.position||lt.morphAttributes.normal||lt.morphAttributes.color,Ht=St!==void 0?St.length:0;let se=0;lt.morphAttributes.position!==void 0&&(se=1),lt.morphAttributes.normal!==void 0&&(se=2),lt.morphAttributes.color!==void 0&&(se=3);let Te,I,ct,J;if(gt){const xe=Wi[gt];Te=xe.vertexShader,I=xe.fragmentShader}else Te=w.vertexShader,I=w.fragmentShader,g.update(w),ct=g.getVertexShaderID(w),J=g.getFragmentShaderID(w);const it=o.getRenderTarget(),xt=o.state.buffers.depth.getReversed(),Ut=ut.isInstancedMesh===!0,At=ut.isBatchedMesh===!0,Mt=!!w.map,Yt=!!w.matcap,L=!!st,Fe=!!w.aoMap,ae=!!w.lightMap,Kt=!!w.bumpMap,Nt=!!w.normalMap,ne=!!w.displacementMap,Bt=!!w.emissiveMap,re=!!w.metalnessMap,ke=!!w.roughnessMap,qe=w.anisotropy>0,U=w.clearcoat>0,T=w.dispersion>0,tt=w.iridescence>0,dt=w.sheen>0,vt=w.transmission>0,ft=qe&&!!w.anisotropyMap,Vt=U&&!!w.clearcoatMap,Rt=U&&!!w.clearcoatNormalMap,Wt=U&&!!w.clearcoatRoughnessMap,Zt=tt&&!!w.iridescenceMap,Tt=tt&&!!w.iridescenceThicknessMap,Lt=dt&&!!w.sheenColorMap,ee=dt&&!!w.sheenRoughnessMap,jt=!!w.specularMap,Ot=!!w.specularColorMap,ue=!!w.specularIntensityMap,G=vt&&!!w.transmissionMap,bt=vt&&!!w.thicknessMap,wt=!!w.gradientMap,Gt=!!w.alphaMap,yt=w.alphaTest>0,mt=!!w.alphaHash,qt=!!w.extensions;let le=os;w.toneMapped&&(it===null||it.isXRRenderTarget===!0)&&(le=o.toneMapping);const He={shaderID:gt,shaderType:w.type,shaderName:w.name,vertexShader:Te,fragmentShader:I,defines:w.defines,customVertexShaderID:ct,customFragmentShaderID:J,isRawShaderMaterial:w.isRawShaderMaterial===!0,glslVersion:w.glslVersion,precision:M,batching:At,batchingColor:At&&ut._colorsTexture!==null,instancing:Ut,instancingColor:Ut&&ut.instanceColor!==null,instancingMorph:Ut&&ut.morphTexture!==null,supportsVertexTextures:y,outputColorSpace:it===null?o.outputColorSpace:it.isXRRenderTarget===!0?it.texture.colorSpace:oo,alphaToCoverage:!!w.alphaToCoverage,map:Mt,matcap:Yt,envMap:L,envMapMode:L&&st.mapping,envMapCubeUVHeight:Z,aoMap:Fe,lightMap:ae,bumpMap:Kt,normalMap:Nt,displacementMap:y&&ne,emissiveMap:Bt,normalMapObjectSpace:Nt&&w.normalMapType===pE,normalMapTangentSpace:Nt&&w.normalMapType===TS,metalnessMap:re,roughnessMap:ke,anisotropy:qe,anisotropyMap:ft,clearcoat:U,clearcoatMap:Vt,clearcoatNormalMap:Rt,clearcoatRoughnessMap:Wt,dispersion:T,iridescence:tt,iridescenceMap:Zt,iridescenceThicknessMap:Tt,sheen:dt,sheenColorMap:Lt,sheenRoughnessMap:ee,specularMap:jt,specularColorMap:Ot,specularIntensityMap:ue,transmission:vt,transmissionMap:G,thicknessMap:bt,gradientMap:wt,opaque:w.transparent===!1&&w.blending===no&&w.alphaToCoverage===!1,alphaMap:Gt,alphaTest:yt,alphaHash:mt,combine:w.combine,mapUv:Mt&&R(w.map.channel),aoMapUv:Fe&&R(w.aoMap.channel),lightMapUv:ae&&R(w.lightMap.channel),bumpMapUv:Kt&&R(w.bumpMap.channel),normalMapUv:Nt&&R(w.normalMap.channel),displacementMapUv:ne&&R(w.displacementMap.channel),emissiveMapUv:Bt&&R(w.emissiveMap.channel),metalnessMapUv:re&&R(w.metalnessMap.channel),roughnessMapUv:ke&&R(w.roughnessMap.channel),anisotropyMapUv:ft&&R(w.anisotropyMap.channel),clearcoatMapUv:Vt&&R(w.clearcoatMap.channel),clearcoatNormalMapUv:Rt&&R(w.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Wt&&R(w.clearcoatRoughnessMap.channel),iridescenceMapUv:Zt&&R(w.iridescenceMap.channel),iridescenceThicknessMapUv:Tt&&R(w.iridescenceThicknessMap.channel),sheenColorMapUv:Lt&&R(w.sheenColorMap.channel),sheenRoughnessMapUv:ee&&R(w.sheenRoughnessMap.channel),specularMapUv:jt&&R(w.specularMap.channel),specularColorMapUv:Ot&&R(w.specularColorMap.channel),specularIntensityMapUv:ue&&R(w.specularIntensityMap.channel),transmissionMapUv:G&&R(w.transmissionMap.channel),thicknessMapUv:bt&&R(w.thicknessMap.channel),alphaMapUv:Gt&&R(w.alphaMap.channel),vertexTangents:!!lt.attributes.tangent&&(Nt||qe),vertexColors:w.vertexColors,vertexAlphas:w.vertexColors===!0&&!!lt.attributes.color&&lt.attributes.color.itemSize===4,pointsUvs:ut.isPoints===!0&&!!lt.attributes.uv&&(Mt||Gt),fog:!!_t,useFog:w.fog===!0,fogExp2:!!_t&&_t.isFogExp2,flatShading:w.flatShading===!0&&w.wireframe===!1,sizeAttenuation:w.sizeAttenuation===!0,logarithmicDepthBuffer:m,reversedDepthBuffer:xt,skinning:ut.isSkinnedMesh===!0,morphTargets:lt.morphAttributes.position!==void 0,morphNormals:lt.morphAttributes.normal!==void 0,morphColors:lt.morphAttributes.color!==void 0,morphTargetsCount:Ht,morphTextureStride:se,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numClippingPlanes:h.numPlanes,numClipIntersection:h.numIntersection,dithering:w.dithering,shadowMapEnabled:o.shadowMap.enabled&&V.length>0,shadowMapType:o.shadowMap.type,toneMapping:le,decodeVideoTexture:Mt&&w.map.isVideoTexture===!0&&we.getTransfer(w.map.colorSpace)===Ve,decodeVideoTextureEmissive:Bt&&w.emissiveMap.isVideoTexture===!0&&we.getTransfer(w.emissiveMap.colorSpace)===Ve,premultipliedAlpha:w.premultipliedAlpha,doubleSided:w.side===Ma,flipSided:w.side===Kn,useDepthPacking:w.depthPacking>=0,depthPacking:w.depthPacking||0,index0AttributeName:w.index0AttributeName,extensionClipCullDistance:qt&&w.extensions.clipCullDistance===!0&&r.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(qt&&w.extensions.multiDraw===!0||At)&&r.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:w.customProgramCacheKey()};return He.vertexUv1s=_.has(1),He.vertexUv2s=_.has(2),He.vertexUv3s=_.has(3),_.clear(),He}function v(w){const C=[];if(w.shaderID?C.push(w.shaderID):(C.push(w.customVertexShaderID),C.push(w.customFragmentShaderID)),w.defines!==void 0)for(const V in w.defines)C.push(V),C.push(w.defines[V]);return w.isRawShaderMaterial===!1&&(z(C,w),P(C,w),C.push(o.outputColorSpace)),C.push(w.customProgramCacheKey),C.join()}function z(w,C){w.push(C.precision),w.push(C.outputColorSpace),w.push(C.envMapMode),w.push(C.envMapCubeUVHeight),w.push(C.mapUv),w.push(C.alphaMapUv),w.push(C.lightMapUv),w.push(C.aoMapUv),w.push(C.bumpMapUv),w.push(C.normalMapUv),w.push(C.displacementMapUv),w.push(C.emissiveMapUv),w.push(C.metalnessMapUv),w.push(C.roughnessMapUv),w.push(C.anisotropyMapUv),w.push(C.clearcoatMapUv),w.push(C.clearcoatNormalMapUv),w.push(C.clearcoatRoughnessMapUv),w.push(C.iridescenceMapUv),w.push(C.iridescenceThicknessMapUv),w.push(C.sheenColorMapUv),w.push(C.sheenRoughnessMapUv),w.push(C.specularMapUv),w.push(C.specularColorMapUv),w.push(C.specularIntensityMapUv),w.push(C.transmissionMapUv),w.push(C.thicknessMapUv),w.push(C.combine),w.push(C.fogExp2),w.push(C.sizeAttenuation),w.push(C.morphTargetsCount),w.push(C.morphAttributeCount),w.push(C.numDirLights),w.push(C.numPointLights),w.push(C.numSpotLights),w.push(C.numSpotLightMaps),w.push(C.numHemiLights),w.push(C.numRectAreaLights),w.push(C.numDirLightShadows),w.push(C.numPointLightShadows),w.push(C.numSpotLightShadows),w.push(C.numSpotLightShadowsWithMaps),w.push(C.numLightProbes),w.push(C.shadowMapType),w.push(C.toneMapping),w.push(C.numClippingPlanes),w.push(C.numClipIntersection),w.push(C.depthPacking)}function P(w,C){d.disableAll(),C.supportsVertexTextures&&d.enable(0),C.instancing&&d.enable(1),C.instancingColor&&d.enable(2),C.instancingMorph&&d.enable(3),C.matcap&&d.enable(4),C.envMap&&d.enable(5),C.normalMapObjectSpace&&d.enable(6),C.normalMapTangentSpace&&d.enable(7),C.clearcoat&&d.enable(8),C.iridescence&&d.enable(9),C.alphaTest&&d.enable(10),C.vertexColors&&d.enable(11),C.vertexAlphas&&d.enable(12),C.vertexUv1s&&d.enable(13),C.vertexUv2s&&d.enable(14),C.vertexUv3s&&d.enable(15),C.vertexTangents&&d.enable(16),C.anisotropy&&d.enable(17),C.alphaHash&&d.enable(18),C.batching&&d.enable(19),C.dispersion&&d.enable(20),C.batchingColor&&d.enable(21),C.gradientMap&&d.enable(22),w.push(d.mask),d.disableAll(),C.fog&&d.enable(0),C.useFog&&d.enable(1),C.flatShading&&d.enable(2),C.logarithmicDepthBuffer&&d.enable(3),C.reversedDepthBuffer&&d.enable(4),C.skinning&&d.enable(5),C.morphTargets&&d.enable(6),C.morphNormals&&d.enable(7),C.morphColors&&d.enable(8),C.premultipliedAlpha&&d.enable(9),C.shadowMapEnabled&&d.enable(10),C.doubleSided&&d.enable(11),C.flipSided&&d.enable(12),C.useDepthPacking&&d.enable(13),C.dithering&&d.enable(14),C.transmission&&d.enable(15),C.sheen&&d.enable(16),C.opaque&&d.enable(17),C.pointsUvs&&d.enable(18),C.decodeVideoTexture&&d.enable(19),C.decodeVideoTextureEmissive&&d.enable(20),C.alphaToCoverage&&d.enable(21),w.push(d.mask)}function D(w){const C=A[w.type];let V;if(C){const at=Wi[C];V=aT.clone(at.uniforms)}else V=w.uniforms;return V}function H(w,C){let V;for(let at=0,ut=S.length;at<ut;at++){const _t=S[at];if(_t.cacheKey===C){V=_t,++V.usedTimes;break}}return V===void 0&&(V=new PR(o,C,w,f),S.push(V)),V}function B(w){if(--w.usedTimes===0){const C=S.indexOf(w);S[C]=S[S.length-1],S.pop(),w.destroy()}}function O(w){g.remove(w)}function k(){g.dispose()}return{getParameters:x,getProgramCacheKey:v,getUniforms:D,acquireProgram:H,releaseProgram:B,releaseShaderCache:O,programs:S,dispose:k}}function HR(){let o=new WeakMap;function e(h){return o.has(h)}function i(h){let d=o.get(h);return d===void 0&&(d={},o.set(h,d)),d}function r(h){o.delete(h)}function u(h,d,g){o.get(h)[d]=g}function f(){o=new WeakMap}return{has:e,get:i,remove:r,update:u,dispose:f}}function GR(o,e){return o.groupOrder!==e.groupOrder?o.groupOrder-e.groupOrder:o.renderOrder!==e.renderOrder?o.renderOrder-e.renderOrder:o.material.id!==e.material.id?o.material.id-e.material.id:o.z!==e.z?o.z-e.z:o.id-e.id}function uS(o,e){return o.groupOrder!==e.groupOrder?o.groupOrder-e.groupOrder:o.renderOrder!==e.renderOrder?o.renderOrder-e.renderOrder:o.z!==e.z?e.z-o.z:o.id-e.id}function cS(){const o=[];let e=0;const i=[],r=[],u=[];function f(){e=0,i.length=0,r.length=0,u.length=0}function h(m,y,M,A,R,x){let v=o[e];return v===void 0?(v={id:m.id,object:m,geometry:y,material:M,groupOrder:A,renderOrder:m.renderOrder,z:R,group:x},o[e]=v):(v.id=m.id,v.object=m,v.geometry=y,v.material=M,v.groupOrder=A,v.renderOrder=m.renderOrder,v.z=R,v.group=x),e++,v}function d(m,y,M,A,R,x){const v=h(m,y,M,A,R,x);M.transmission>0?r.push(v):M.transparent===!0?u.push(v):i.push(v)}function g(m,y,M,A,R,x){const v=h(m,y,M,A,R,x);M.transmission>0?r.unshift(v):M.transparent===!0?u.unshift(v):i.unshift(v)}function _(m,y){i.length>1&&i.sort(m||GR),r.length>1&&r.sort(y||uS),u.length>1&&u.sort(y||uS)}function S(){for(let m=e,y=o.length;m<y;m++){const M=o[m];if(M.id===null)break;M.id=null,M.object=null,M.geometry=null,M.material=null,M.group=null}}return{opaque:i,transmissive:r,transparent:u,init:f,push:d,unshift:g,finish:S,sort:_}}function VR(){let o=new WeakMap;function e(r,u){const f=o.get(r);let h;return f===void 0?(h=new cS,o.set(r,[h])):u>=f.length?(h=new cS,f.push(h)):h=f[u],h}function i(){o=new WeakMap}return{get:e,dispose:i}}function XR(){const o={};return{get:function(e){if(o[e.id]!==void 0)return o[e.id];let i;switch(e.type){case"DirectionalLight":i={direction:new nt,color:new De};break;case"SpotLight":i={position:new nt,direction:new nt,color:new De,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":i={position:new nt,color:new De,distance:0,decay:0};break;case"HemisphereLight":i={direction:new nt,skyColor:new De,groundColor:new De};break;case"RectAreaLight":i={color:new De,position:new nt,halfWidth:new nt,halfHeight:new nt};break}return o[e.id]=i,i}}}function kR(){const o={};return{get:function(e){if(o[e.id]!==void 0)return o[e.id];let i;switch(e.type){case"DirectionalLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce};break;case"SpotLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce};break;case"PointLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce,shadowCameraNear:1,shadowCameraFar:1e3};break}return o[e.id]=i,i}}}let YR=0;function qR(o,e){return(e.castShadow?2:0)-(o.castShadow?2:0)+(e.map?1:0)-(o.map?1:0)}function WR(o){const e=new XR,i=kR(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let _=0;_<9;_++)r.probe.push(new nt);const u=new nt,f=new Ke,h=new Ke;function d(_){let S=0,m=0,y=0;for(let w=0;w<9;w++)r.probe[w].set(0,0,0);let M=0,A=0,R=0,x=0,v=0,z=0,P=0,D=0,H=0,B=0,O=0;_.sort(qR);for(let w=0,C=_.length;w<C;w++){const V=_[w],at=V.color,ut=V.intensity,_t=V.distance,lt=V.shadow&&V.shadow.map?V.shadow.map.texture:null;if(V.isAmbientLight)S+=at.r*ut,m+=at.g*ut,y+=at.b*ut;else if(V.isLightProbe){for(let W=0;W<9;W++)r.probe[W].addScaledVector(V.sh.coefficients[W],ut);O++}else if(V.isDirectionalLight){const W=e.get(V);if(W.color.copy(V.color).multiplyScalar(V.intensity),V.castShadow){const st=V.shadow,Z=i.get(V);Z.shadowIntensity=st.intensity,Z.shadowBias=st.bias,Z.shadowNormalBias=st.normalBias,Z.shadowRadius=st.radius,Z.shadowMapSize=st.mapSize,r.directionalShadow[M]=Z,r.directionalShadowMap[M]=lt,r.directionalShadowMatrix[M]=V.shadow.matrix,z++}r.directional[M]=W,M++}else if(V.isSpotLight){const W=e.get(V);W.position.setFromMatrixPosition(V.matrixWorld),W.color.copy(at).multiplyScalar(ut),W.distance=_t,W.coneCos=Math.cos(V.angle),W.penumbraCos=Math.cos(V.angle*(1-V.penumbra)),W.decay=V.decay,r.spot[R]=W;const st=V.shadow;if(V.map&&(r.spotLightMap[H]=V.map,H++,st.updateMatrices(V),V.castShadow&&B++),r.spotLightMatrix[R]=st.matrix,V.castShadow){const Z=i.get(V);Z.shadowIntensity=st.intensity,Z.shadowBias=st.bias,Z.shadowNormalBias=st.normalBias,Z.shadowRadius=st.radius,Z.shadowMapSize=st.mapSize,r.spotShadow[R]=Z,r.spotShadowMap[R]=lt,D++}R++}else if(V.isRectAreaLight){const W=e.get(V);W.color.copy(at).multiplyScalar(ut),W.halfWidth.set(V.width*.5,0,0),W.halfHeight.set(0,V.height*.5,0),r.rectArea[x]=W,x++}else if(V.isPointLight){const W=e.get(V);if(W.color.copy(V.color).multiplyScalar(V.intensity),W.distance=V.distance,W.decay=V.decay,V.castShadow){const st=V.shadow,Z=i.get(V);Z.shadowIntensity=st.intensity,Z.shadowBias=st.bias,Z.shadowNormalBias=st.normalBias,Z.shadowRadius=st.radius,Z.shadowMapSize=st.mapSize,Z.shadowCameraNear=st.camera.near,Z.shadowCameraFar=st.camera.far,r.pointShadow[A]=Z,r.pointShadowMap[A]=lt,r.pointShadowMatrix[A]=V.shadow.matrix,P++}r.point[A]=W,A++}else if(V.isHemisphereLight){const W=e.get(V);W.skyColor.copy(V.color).multiplyScalar(ut),W.groundColor.copy(V.groundColor).multiplyScalar(ut),r.hemi[v]=W,v++}}x>0&&(o.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=zt.LTC_FLOAT_1,r.rectAreaLTC2=zt.LTC_FLOAT_2):(r.rectAreaLTC1=zt.LTC_HALF_1,r.rectAreaLTC2=zt.LTC_HALF_2)),r.ambient[0]=S,r.ambient[1]=m,r.ambient[2]=y;const k=r.hash;(k.directionalLength!==M||k.pointLength!==A||k.spotLength!==R||k.rectAreaLength!==x||k.hemiLength!==v||k.numDirectionalShadows!==z||k.numPointShadows!==P||k.numSpotShadows!==D||k.numSpotMaps!==H||k.numLightProbes!==O)&&(r.directional.length=M,r.spot.length=R,r.rectArea.length=x,r.point.length=A,r.hemi.length=v,r.directionalShadow.length=z,r.directionalShadowMap.length=z,r.pointShadow.length=P,r.pointShadowMap.length=P,r.spotShadow.length=D,r.spotShadowMap.length=D,r.directionalShadowMatrix.length=z,r.pointShadowMatrix.length=P,r.spotLightMatrix.length=D+H-B,r.spotLightMap.length=H,r.numSpotLightShadowsWithMaps=B,r.numLightProbes=O,k.directionalLength=M,k.pointLength=A,k.spotLength=R,k.rectAreaLength=x,k.hemiLength=v,k.numDirectionalShadows=z,k.numPointShadows=P,k.numSpotShadows=D,k.numSpotMaps=H,k.numLightProbes=O,r.version=YR++)}function g(_,S){let m=0,y=0,M=0,A=0,R=0;const x=S.matrixWorldInverse;for(let v=0,z=_.length;v<z;v++){const P=_[v];if(P.isDirectionalLight){const D=r.directional[m];D.direction.setFromMatrixPosition(P.matrixWorld),u.setFromMatrixPosition(P.target.matrixWorld),D.direction.sub(u),D.direction.transformDirection(x),m++}else if(P.isSpotLight){const D=r.spot[M];D.position.setFromMatrixPosition(P.matrixWorld),D.position.applyMatrix4(x),D.direction.setFromMatrixPosition(P.matrixWorld),u.setFromMatrixPosition(P.target.matrixWorld),D.direction.sub(u),D.direction.transformDirection(x),M++}else if(P.isRectAreaLight){const D=r.rectArea[A];D.position.setFromMatrixPosition(P.matrixWorld),D.position.applyMatrix4(x),h.identity(),f.copy(P.matrixWorld),f.premultiply(x),h.extractRotation(f),D.halfWidth.set(P.width*.5,0,0),D.halfHeight.set(0,P.height*.5,0),D.halfWidth.applyMatrix4(h),D.halfHeight.applyMatrix4(h),A++}else if(P.isPointLight){const D=r.point[y];D.position.setFromMatrixPosition(P.matrixWorld),D.position.applyMatrix4(x),y++}else if(P.isHemisphereLight){const D=r.hemi[R];D.direction.setFromMatrixPosition(P.matrixWorld),D.direction.transformDirection(x),R++}}}return{setup:d,setupView:g,state:r}}function fS(o){const e=new WR(o),i=[],r=[];function u(S){_.camera=S,i.length=0,r.length=0}function f(S){i.push(S)}function h(S){r.push(S)}function d(){e.setup(i)}function g(S){e.setupView(i,S)}const _={lightsArray:i,shadowsArray:r,camera:null,lights:e,transmissionRenderTarget:{}};return{init:u,state:_,setupLights:d,setupLightsView:g,pushLight:f,pushShadow:h}}function jR(o){let e=new WeakMap;function i(u,f=0){const h=e.get(u);let d;return h===void 0?(d=new fS(o),e.set(u,[d])):f>=h.length?(d=new fS(o),h.push(d)):d=h[f],d}function r(){e=new WeakMap}return{get:i,dispose:r}}const ZR=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,KR=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function QR(o,e,i){let r=new kp;const u=new ce,f=new ce,h=new sn,d=new vT({depthPacking:dE}),g=new ST,_={},S=i.maxTextureSize,m={[ls]:Kn,[Kn]:ls,[Ma]:Ma},y=new us({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ce},radius:{value:4}},vertexShader:ZR,fragmentShader:KR}),M=y.clone();M.defines.HORIZONTAL_PASS=1;const A=new cs;A.setAttribute("position",new Oi(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const R=new Mi(A,y),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=pS;let v=this.type;this.render=function(B,O,k){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||B.length===0)return;const w=o.getRenderTarget(),C=o.getActiveCubeFace(),V=o.getActiveMipmapLevel(),at=o.state;at.setBlending(rs),at.buffers.depth.getReversed()===!0?at.buffers.color.setClear(0,0,0,0):at.buffers.color.setClear(1,1,1,1),at.buffers.depth.setTest(!0),at.setScissorTest(!1);const ut=v!==xa&&this.type===xa,_t=v===xa&&this.type!==xa;for(let lt=0,W=B.length;lt<W;lt++){const st=B[lt],Z=st.shadow;if(Z===void 0){console.warn("THREE.WebGLShadowMap:",st,"has no shadow.");continue}if(Z.autoUpdate===!1&&Z.needsUpdate===!1)continue;u.copy(Z.mapSize);const gt=Z.getFrameExtents();if(u.multiply(gt),f.copy(Z.mapSize),(u.x>S||u.y>S)&&(u.x>S&&(f.x=Math.floor(S/gt.x),u.x=f.x*gt.x,Z.mapSize.x=f.x),u.y>S&&(f.y=Math.floor(S/gt.y),u.y=f.y*gt.y,Z.mapSize.y=f.y)),Z.map===null||ut===!0||_t===!0){const Ht=this.type!==xa?{minFilter:ui,magFilter:ui}:{};Z.map!==null&&Z.map.dispose(),Z.map=new js(u.x,u.y,Ht),Z.map.texture.name=st.name+".shadowMap",Z.camera.updateProjectionMatrix()}o.setRenderTarget(Z.map),o.clear();const St=Z.getViewportCount();for(let Ht=0;Ht<St;Ht++){const se=Z.getViewport(Ht);h.set(f.x*se.x,f.y*se.y,f.x*se.z,f.y*se.w),at.viewport(h),Z.updateMatrices(st,Ht),r=Z.getFrustum(),D(O,k,Z.camera,st,this.type)}Z.isPointLightShadow!==!0&&this.type===xa&&z(Z,k),Z.needsUpdate=!1}v=this.type,x.needsUpdate=!1,o.setRenderTarget(w,C,V)};function z(B,O){const k=e.update(R);y.defines.VSM_SAMPLES!==B.blurSamples&&(y.defines.VSM_SAMPLES=B.blurSamples,M.defines.VSM_SAMPLES=B.blurSamples,y.needsUpdate=!0,M.needsUpdate=!0),B.mapPass===null&&(B.mapPass=new js(u.x,u.y)),y.uniforms.shadow_pass.value=B.map.texture,y.uniforms.resolution.value=B.mapSize,y.uniforms.radius.value=B.radius,o.setRenderTarget(B.mapPass),o.clear(),o.renderBufferDirect(O,null,k,y,R,null),M.uniforms.shadow_pass.value=B.mapPass.texture,M.uniforms.resolution.value=B.mapSize,M.uniforms.radius.value=B.radius,o.setRenderTarget(B.map),o.clear(),o.renderBufferDirect(O,null,k,M,R,null)}function P(B,O,k,w){let C=null;const V=k.isPointLight===!0?B.customDistanceMaterial:B.customDepthMaterial;if(V!==void 0)C=V;else if(C=k.isPointLight===!0?g:d,o.localClippingEnabled&&O.clipShadows===!0&&Array.isArray(O.clippingPlanes)&&O.clippingPlanes.length!==0||O.displacementMap&&O.displacementScale!==0||O.alphaMap&&O.alphaTest>0||O.map&&O.alphaTest>0||O.alphaToCoverage===!0){const at=C.uuid,ut=O.uuid;let _t=_[at];_t===void 0&&(_t={},_[at]=_t);let lt=_t[ut];lt===void 0&&(lt=C.clone(),_t[ut]=lt,O.addEventListener("dispose",H)),C=lt}if(C.visible=O.visible,C.wireframe=O.wireframe,w===xa?C.side=O.shadowSide!==null?O.shadowSide:O.side:C.side=O.shadowSide!==null?O.shadowSide:m[O.side],C.alphaMap=O.alphaMap,C.alphaTest=O.alphaToCoverage===!0?.5:O.alphaTest,C.map=O.map,C.clipShadows=O.clipShadows,C.clippingPlanes=O.clippingPlanes,C.clipIntersection=O.clipIntersection,C.displacementMap=O.displacementMap,C.displacementScale=O.displacementScale,C.displacementBias=O.displacementBias,C.wireframeLinewidth=O.wireframeLinewidth,C.linewidth=O.linewidth,k.isPointLight===!0&&C.isMeshDistanceMaterial===!0){const at=o.properties.get(C);at.light=k}return C}function D(B,O,k,w,C){if(B.visible===!1)return;if(B.layers.test(O.layers)&&(B.isMesh||B.isLine||B.isPoints)&&(B.castShadow||B.receiveShadow&&C===xa)&&(!B.frustumCulled||r.intersectsObject(B))){B.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,B.matrixWorld);const ut=e.update(B),_t=B.material;if(Array.isArray(_t)){const lt=ut.groups;for(let W=0,st=lt.length;W<st;W++){const Z=lt[W],gt=_t[Z.materialIndex];if(gt&&gt.visible){const St=P(B,gt,w,C);B.onBeforeShadow(o,B,O,k,ut,St,Z),o.renderBufferDirect(k,null,ut,St,B,Z),B.onAfterShadow(o,B,O,k,ut,St,Z)}}}else if(_t.visible){const lt=P(B,_t,w,C);B.onBeforeShadow(o,B,O,k,ut,lt,null),o.renderBufferDirect(k,null,ut,lt,B,null),B.onAfterShadow(o,B,O,k,ut,lt,null)}}const at=B.children;for(let ut=0,_t=at.length;ut<_t;ut++)D(at[ut],O,k,w,C)}function H(B){B.target.removeEventListener("dispose",H);for(const k in _){const w=_[k],C=B.target.uuid;C in w&&(w[C].dispose(),delete w[C])}}}const JR={[Vd]:Xd,[kd]:Wd,[Yd]:jd,[ao]:qd,[Xd]:Vd,[Wd]:kd,[jd]:Yd,[qd]:ao};function $R(o,e){function i(){let G=!1;const bt=new sn;let wt=null;const Gt=new sn(0,0,0,0);return{setMask:function(yt){wt!==yt&&!G&&(o.colorMask(yt,yt,yt,yt),wt=yt)},setLocked:function(yt){G=yt},setClear:function(yt,mt,qt,le,He){He===!0&&(yt*=le,mt*=le,qt*=le),bt.set(yt,mt,qt,le),Gt.equals(bt)===!1&&(o.clearColor(yt,mt,qt,le),Gt.copy(bt))},reset:function(){G=!1,wt=null,Gt.set(-1,0,0,0)}}}function r(){let G=!1,bt=!1,wt=null,Gt=null,yt=null;return{setReversed:function(mt){if(bt!==mt){const qt=e.get("EXT_clip_control");mt?qt.clipControlEXT(qt.LOWER_LEFT_EXT,qt.ZERO_TO_ONE_EXT):qt.clipControlEXT(qt.LOWER_LEFT_EXT,qt.NEGATIVE_ONE_TO_ONE_EXT),bt=mt;const le=yt;yt=null,this.setClear(le)}},getReversed:function(){return bt},setTest:function(mt){mt?it(o.DEPTH_TEST):xt(o.DEPTH_TEST)},setMask:function(mt){wt!==mt&&!G&&(o.depthMask(mt),wt=mt)},setFunc:function(mt){if(bt&&(mt=JR[mt]),Gt!==mt){switch(mt){case Vd:o.depthFunc(o.NEVER);break;case Xd:o.depthFunc(o.ALWAYS);break;case kd:o.depthFunc(o.LESS);break;case ao:o.depthFunc(o.LEQUAL);break;case Yd:o.depthFunc(o.EQUAL);break;case qd:o.depthFunc(o.GEQUAL);break;case Wd:o.depthFunc(o.GREATER);break;case jd:o.depthFunc(o.NOTEQUAL);break;default:o.depthFunc(o.LEQUAL)}Gt=mt}},setLocked:function(mt){G=mt},setClear:function(mt){yt!==mt&&(bt&&(mt=1-mt),o.clearDepth(mt),yt=mt)},reset:function(){G=!1,wt=null,Gt=null,yt=null,bt=!1}}}function u(){let G=!1,bt=null,wt=null,Gt=null,yt=null,mt=null,qt=null,le=null,He=null;return{setTest:function(xe){G||(xe?it(o.STENCIL_TEST):xt(o.STENCIL_TEST))},setMask:function(xe){bt!==xe&&!G&&(o.stencilMask(xe),bt=xe)},setFunc:function(xe,$e,pn){(wt!==xe||Gt!==$e||yt!==pn)&&(o.stencilFunc(xe,$e,pn),wt=xe,Gt=$e,yt=pn)},setOp:function(xe,$e,pn){(mt!==xe||qt!==$e||le!==pn)&&(o.stencilOp(xe,$e,pn),mt=xe,qt=$e,le=pn)},setLocked:function(xe){G=xe},setClear:function(xe){He!==xe&&(o.clearStencil(xe),He=xe)},reset:function(){G=!1,bt=null,wt=null,Gt=null,yt=null,mt=null,qt=null,le=null,He=null}}}const f=new i,h=new r,d=new u,g=new WeakMap,_=new WeakMap;let S={},m={},y=new WeakMap,M=[],A=null,R=!1,x=null,v=null,z=null,P=null,D=null,H=null,B=null,O=new De(0,0,0),k=0,w=!1,C=null,V=null,at=null,ut=null,_t=null;const lt=o.getParameter(o.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let W=!1,st=0;const Z=o.getParameter(o.VERSION);Z.indexOf("WebGL")!==-1?(st=parseFloat(/^WebGL (\d)/.exec(Z)[1]),W=st>=1):Z.indexOf("OpenGL ES")!==-1&&(st=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),W=st>=2);let gt=null,St={};const Ht=o.getParameter(o.SCISSOR_BOX),se=o.getParameter(o.VIEWPORT),Te=new sn().fromArray(Ht),I=new sn().fromArray(se);function ct(G,bt,wt,Gt){const yt=new Uint8Array(4),mt=o.createTexture();o.bindTexture(G,mt),o.texParameteri(G,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(G,o.TEXTURE_MAG_FILTER,o.NEAREST);for(let qt=0;qt<wt;qt++)G===o.TEXTURE_3D||G===o.TEXTURE_2D_ARRAY?o.texImage3D(bt,0,o.RGBA,1,1,Gt,0,o.RGBA,o.UNSIGNED_BYTE,yt):o.texImage2D(bt+qt,0,o.RGBA,1,1,0,o.RGBA,o.UNSIGNED_BYTE,yt);return mt}const J={};J[o.TEXTURE_2D]=ct(o.TEXTURE_2D,o.TEXTURE_2D,1),J[o.TEXTURE_CUBE_MAP]=ct(o.TEXTURE_CUBE_MAP,o.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[o.TEXTURE_2D_ARRAY]=ct(o.TEXTURE_2D_ARRAY,o.TEXTURE_2D_ARRAY,1,1),J[o.TEXTURE_3D]=ct(o.TEXTURE_3D,o.TEXTURE_3D,1,1),f.setClear(0,0,0,1),h.setClear(1),d.setClear(0),it(o.DEPTH_TEST),h.setFunc(ao),Kt(!1),Nt(lv),it(o.CULL_FACE),Fe(rs);function it(G){S[G]!==!0&&(o.enable(G),S[G]=!0)}function xt(G){S[G]!==!1&&(o.disable(G),S[G]=!1)}function Ut(G,bt){return m[G]!==bt?(o.bindFramebuffer(G,bt),m[G]=bt,G===o.DRAW_FRAMEBUFFER&&(m[o.FRAMEBUFFER]=bt),G===o.FRAMEBUFFER&&(m[o.DRAW_FRAMEBUFFER]=bt),!0):!1}function At(G,bt){let wt=M,Gt=!1;if(G){wt=y.get(bt),wt===void 0&&(wt=[],y.set(bt,wt));const yt=G.textures;if(wt.length!==yt.length||wt[0]!==o.COLOR_ATTACHMENT0){for(let mt=0,qt=yt.length;mt<qt;mt++)wt[mt]=o.COLOR_ATTACHMENT0+mt;wt.length=yt.length,Gt=!0}}else wt[0]!==o.BACK&&(wt[0]=o.BACK,Gt=!0);Gt&&o.drawBuffers(wt)}function Mt(G){return A!==G?(o.useProgram(G),A=G,!0):!1}const Yt={[Vs]:o.FUNC_ADD,[FM]:o.FUNC_SUBTRACT,[HM]:o.FUNC_REVERSE_SUBTRACT};Yt[GM]=o.MIN,Yt[VM]=o.MAX;const L={[XM]:o.ZERO,[kM]:o.ONE,[YM]:o.SRC_COLOR,[Hd]:o.SRC_ALPHA,[QM]:o.SRC_ALPHA_SATURATE,[ZM]:o.DST_COLOR,[WM]:o.DST_ALPHA,[qM]:o.ONE_MINUS_SRC_COLOR,[Gd]:o.ONE_MINUS_SRC_ALPHA,[KM]:o.ONE_MINUS_DST_COLOR,[jM]:o.ONE_MINUS_DST_ALPHA,[JM]:o.CONSTANT_COLOR,[$M]:o.ONE_MINUS_CONSTANT_COLOR,[tE]:o.CONSTANT_ALPHA,[eE]:o.ONE_MINUS_CONSTANT_ALPHA};function Fe(G,bt,wt,Gt,yt,mt,qt,le,He,xe){if(G===rs){R===!0&&(xt(o.BLEND),R=!1);return}if(R===!1&&(it(o.BLEND),R=!0),G!==BM){if(G!==x||xe!==w){if((v!==Vs||D!==Vs)&&(o.blendEquation(o.FUNC_ADD),v=Vs,D=Vs),xe)switch(G){case no:o.blendFuncSeparate(o.ONE,o.ONE_MINUS_SRC_ALPHA,o.ONE,o.ONE_MINUS_SRC_ALPHA);break;case uv:o.blendFunc(o.ONE,o.ONE);break;case cv:o.blendFuncSeparate(o.ZERO,o.ONE_MINUS_SRC_COLOR,o.ZERO,o.ONE);break;case fv:o.blendFuncSeparate(o.DST_COLOR,o.ONE_MINUS_SRC_ALPHA,o.ZERO,o.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",G);break}else switch(G){case no:o.blendFuncSeparate(o.SRC_ALPHA,o.ONE_MINUS_SRC_ALPHA,o.ONE,o.ONE_MINUS_SRC_ALPHA);break;case uv:o.blendFuncSeparate(o.SRC_ALPHA,o.ONE,o.ONE,o.ONE);break;case cv:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case fv:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",G);break}z=null,P=null,H=null,B=null,O.set(0,0,0),k=0,x=G,w=xe}return}yt=yt||bt,mt=mt||wt,qt=qt||Gt,(bt!==v||yt!==D)&&(o.blendEquationSeparate(Yt[bt],Yt[yt]),v=bt,D=yt),(wt!==z||Gt!==P||mt!==H||qt!==B)&&(o.blendFuncSeparate(L[wt],L[Gt],L[mt],L[qt]),z=wt,P=Gt,H=mt,B=qt),(le.equals(O)===!1||He!==k)&&(o.blendColor(le.r,le.g,le.b,He),O.copy(le),k=He),x=G,w=!1}function ae(G,bt){G.side===Ma?xt(o.CULL_FACE):it(o.CULL_FACE);let wt=G.side===Kn;bt&&(wt=!wt),Kt(wt),G.blending===no&&G.transparent===!1?Fe(rs):Fe(G.blending,G.blendEquation,G.blendSrc,G.blendDst,G.blendEquationAlpha,G.blendSrcAlpha,G.blendDstAlpha,G.blendColor,G.blendAlpha,G.premultipliedAlpha),h.setFunc(G.depthFunc),h.setTest(G.depthTest),h.setMask(G.depthWrite),f.setMask(G.colorWrite);const Gt=G.stencilWrite;d.setTest(Gt),Gt&&(d.setMask(G.stencilWriteMask),d.setFunc(G.stencilFunc,G.stencilRef,G.stencilFuncMask),d.setOp(G.stencilFail,G.stencilZFail,G.stencilZPass)),Bt(G.polygonOffset,G.polygonOffsetFactor,G.polygonOffsetUnits),G.alphaToCoverage===!0?it(o.SAMPLE_ALPHA_TO_COVERAGE):xt(o.SAMPLE_ALPHA_TO_COVERAGE)}function Kt(G){C!==G&&(G?o.frontFace(o.CW):o.frontFace(o.CCW),C=G)}function Nt(G){G!==PM?(it(o.CULL_FACE),G!==V&&(G===lv?o.cullFace(o.BACK):G===zM?o.cullFace(o.FRONT):o.cullFace(o.FRONT_AND_BACK))):xt(o.CULL_FACE),V=G}function ne(G){G!==at&&(W&&o.lineWidth(G),at=G)}function Bt(G,bt,wt){G?(it(o.POLYGON_OFFSET_FILL),(ut!==bt||_t!==wt)&&(o.polygonOffset(bt,wt),ut=bt,_t=wt)):xt(o.POLYGON_OFFSET_FILL)}function re(G){G?it(o.SCISSOR_TEST):xt(o.SCISSOR_TEST)}function ke(G){G===void 0&&(G=o.TEXTURE0+lt-1),gt!==G&&(o.activeTexture(G),gt=G)}function qe(G,bt,wt){wt===void 0&&(gt===null?wt=o.TEXTURE0+lt-1:wt=gt);let Gt=St[wt];Gt===void 0&&(Gt={type:void 0,texture:void 0},St[wt]=Gt),(Gt.type!==G||Gt.texture!==bt)&&(gt!==wt&&(o.activeTexture(wt),gt=wt),o.bindTexture(G,bt||J[G]),Gt.type=G,Gt.texture=bt)}function U(){const G=St[gt];G!==void 0&&G.type!==void 0&&(o.bindTexture(G.type,null),G.type=void 0,G.texture=void 0)}function T(){try{o.compressedTexImage2D(...arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function tt(){try{o.compressedTexImage3D(...arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function dt(){try{o.texSubImage2D(...arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function vt(){try{o.texSubImage3D(...arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function ft(){try{o.compressedTexSubImage2D(...arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function Vt(){try{o.compressedTexSubImage3D(...arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function Rt(){try{o.texStorage2D(...arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function Wt(){try{o.texStorage3D(...arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function Zt(){try{o.texImage2D(...arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function Tt(){try{o.texImage3D(...arguments)}catch(G){console.error("THREE.WebGLState:",G)}}function Lt(G){Te.equals(G)===!1&&(o.scissor(G.x,G.y,G.z,G.w),Te.copy(G))}function ee(G){I.equals(G)===!1&&(o.viewport(G.x,G.y,G.z,G.w),I.copy(G))}function jt(G,bt){let wt=_.get(bt);wt===void 0&&(wt=new WeakMap,_.set(bt,wt));let Gt=wt.get(G);Gt===void 0&&(Gt=o.getUniformBlockIndex(bt,G.name),wt.set(G,Gt))}function Ot(G,bt){const Gt=_.get(bt).get(G);g.get(bt)!==Gt&&(o.uniformBlockBinding(bt,Gt,G.__bindingPointIndex),g.set(bt,Gt))}function ue(){o.disable(o.BLEND),o.disable(o.CULL_FACE),o.disable(o.DEPTH_TEST),o.disable(o.POLYGON_OFFSET_FILL),o.disable(o.SCISSOR_TEST),o.disable(o.STENCIL_TEST),o.disable(o.SAMPLE_ALPHA_TO_COVERAGE),o.blendEquation(o.FUNC_ADD),o.blendFunc(o.ONE,o.ZERO),o.blendFuncSeparate(o.ONE,o.ZERO,o.ONE,o.ZERO),o.blendColor(0,0,0,0),o.colorMask(!0,!0,!0,!0),o.clearColor(0,0,0,0),o.depthMask(!0),o.depthFunc(o.LESS),h.setReversed(!1),o.clearDepth(1),o.stencilMask(4294967295),o.stencilFunc(o.ALWAYS,0,4294967295),o.stencilOp(o.KEEP,o.KEEP,o.KEEP),o.clearStencil(0),o.cullFace(o.BACK),o.frontFace(o.CCW),o.polygonOffset(0,0),o.activeTexture(o.TEXTURE0),o.bindFramebuffer(o.FRAMEBUFFER,null),o.bindFramebuffer(o.DRAW_FRAMEBUFFER,null),o.bindFramebuffer(o.READ_FRAMEBUFFER,null),o.useProgram(null),o.lineWidth(1),o.scissor(0,0,o.canvas.width,o.canvas.height),o.viewport(0,0,o.canvas.width,o.canvas.height),S={},gt=null,St={},m={},y=new WeakMap,M=[],A=null,R=!1,x=null,v=null,z=null,P=null,D=null,H=null,B=null,O=new De(0,0,0),k=0,w=!1,C=null,V=null,at=null,ut=null,_t=null,Te.set(0,0,o.canvas.width,o.canvas.height),I.set(0,0,o.canvas.width,o.canvas.height),f.reset(),h.reset(),d.reset()}return{buffers:{color:f,depth:h,stencil:d},enable:it,disable:xt,bindFramebuffer:Ut,drawBuffers:At,useProgram:Mt,setBlending:Fe,setMaterial:ae,setFlipSided:Kt,setCullFace:Nt,setLineWidth:ne,setPolygonOffset:Bt,setScissorTest:re,activeTexture:ke,bindTexture:qe,unbindTexture:U,compressedTexImage2D:T,compressedTexImage3D:tt,texImage2D:Zt,texImage3D:Tt,updateUBOMapping:jt,uniformBlockBinding:Ot,texStorage2D:Rt,texStorage3D:Wt,texSubImage2D:dt,texSubImage3D:vt,compressedTexSubImage2D:ft,compressedTexSubImage3D:Vt,scissor:Lt,viewport:ee,reset:ue}}function tC(o,e,i,r,u,f,h){const d=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,g=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),_=new ce,S=new WeakMap;let m;const y=new WeakMap;let M=!1;try{M=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function A(U,T){return M?new OffscreenCanvas(U,T):Tc("canvas")}function R(U,T,tt){let dt=1;const vt=qe(U);if((vt.width>tt||vt.height>tt)&&(dt=tt/Math.max(vt.width,vt.height)),dt<1)if(typeof HTMLImageElement<"u"&&U instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&U instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&U instanceof ImageBitmap||typeof VideoFrame<"u"&&U instanceof VideoFrame){const ft=Math.floor(dt*vt.width),Vt=Math.floor(dt*vt.height);m===void 0&&(m=A(ft,Vt));const Rt=T?A(ft,Vt):m;return Rt.width=ft,Rt.height=Vt,Rt.getContext("2d").drawImage(U,0,0,ft,Vt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+vt.width+"x"+vt.height+") to ("+ft+"x"+Vt+")."),Rt}else return"data"in U&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+vt.width+"x"+vt.height+")."),U;return U}function x(U){return U.generateMipmaps}function v(U){o.generateMipmap(U)}function z(U){return U.isWebGLCubeRenderTarget?o.TEXTURE_CUBE_MAP:U.isWebGL3DRenderTarget?o.TEXTURE_3D:U.isWebGLArrayRenderTarget||U.isCompressedArrayTexture?o.TEXTURE_2D_ARRAY:o.TEXTURE_2D}function P(U,T,tt,dt,vt=!1){if(U!==null){if(o[U]!==void 0)return o[U];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+U+"'")}let ft=T;if(T===o.RED&&(tt===o.FLOAT&&(ft=o.R32F),tt===o.HALF_FLOAT&&(ft=o.R16F),tt===o.UNSIGNED_BYTE&&(ft=o.R8)),T===o.RED_INTEGER&&(tt===o.UNSIGNED_BYTE&&(ft=o.R8UI),tt===o.UNSIGNED_SHORT&&(ft=o.R16UI),tt===o.UNSIGNED_INT&&(ft=o.R32UI),tt===o.BYTE&&(ft=o.R8I),tt===o.SHORT&&(ft=o.R16I),tt===o.INT&&(ft=o.R32I)),T===o.RG&&(tt===o.FLOAT&&(ft=o.RG32F),tt===o.HALF_FLOAT&&(ft=o.RG16F),tt===o.UNSIGNED_BYTE&&(ft=o.RG8)),T===o.RG_INTEGER&&(tt===o.UNSIGNED_BYTE&&(ft=o.RG8UI),tt===o.UNSIGNED_SHORT&&(ft=o.RG16UI),tt===o.UNSIGNED_INT&&(ft=o.RG32UI),tt===o.BYTE&&(ft=o.RG8I),tt===o.SHORT&&(ft=o.RG16I),tt===o.INT&&(ft=o.RG32I)),T===o.RGB_INTEGER&&(tt===o.UNSIGNED_BYTE&&(ft=o.RGB8UI),tt===o.UNSIGNED_SHORT&&(ft=o.RGB16UI),tt===o.UNSIGNED_INT&&(ft=o.RGB32UI),tt===o.BYTE&&(ft=o.RGB8I),tt===o.SHORT&&(ft=o.RGB16I),tt===o.INT&&(ft=o.RGB32I)),T===o.RGBA_INTEGER&&(tt===o.UNSIGNED_BYTE&&(ft=o.RGBA8UI),tt===o.UNSIGNED_SHORT&&(ft=o.RGBA16UI),tt===o.UNSIGNED_INT&&(ft=o.RGBA32UI),tt===o.BYTE&&(ft=o.RGBA8I),tt===o.SHORT&&(ft=o.RGBA16I),tt===o.INT&&(ft=o.RGBA32I)),T===o.RGB&&(tt===o.UNSIGNED_INT_5_9_9_9_REV&&(ft=o.RGB9_E5),tt===o.UNSIGNED_INT_10F_11F_11F_REV&&(ft=o.R11F_G11F_B10F)),T===o.RGBA){const Vt=vt?Mc:we.getTransfer(dt);tt===o.FLOAT&&(ft=o.RGBA32F),tt===o.HALF_FLOAT&&(ft=o.RGBA16F),tt===o.UNSIGNED_BYTE&&(ft=Vt===Ve?o.SRGB8_ALPHA8:o.RGBA8),tt===o.UNSIGNED_SHORT_4_4_4_4&&(ft=o.RGBA4),tt===o.UNSIGNED_SHORT_5_5_5_1&&(ft=o.RGB5_A1)}return(ft===o.R16F||ft===o.R32F||ft===o.RG16F||ft===o.RG32F||ft===o.RGBA16F||ft===o.RGBA32F)&&e.get("EXT_color_buffer_float"),ft}function D(U,T){let tt;return U?T===null||T===qs||T===pl?tt=o.DEPTH24_STENCIL8:T===Zi?tt=o.DEPTH32F_STENCIL8:T===dl&&(tt=o.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):T===null||T===qs||T===pl?tt=o.DEPTH_COMPONENT24:T===Zi?tt=o.DEPTH_COMPONENT32F:T===dl&&(tt=o.DEPTH_COMPONENT16),tt}function H(U,T){return x(U)===!0||U.isFramebufferTexture&&U.minFilter!==ui&&U.minFilter!==ji?Math.log2(Math.max(T.width,T.height))+1:U.mipmaps!==void 0&&U.mipmaps.length>0?U.mipmaps.length:U.isCompressedTexture&&Array.isArray(U.image)?T.mipmaps.length:1}function B(U){const T=U.target;T.removeEventListener("dispose",B),k(T),T.isVideoTexture&&S.delete(T)}function O(U){const T=U.target;T.removeEventListener("dispose",O),C(T)}function k(U){const T=r.get(U);if(T.__webglInit===void 0)return;const tt=U.source,dt=y.get(tt);if(dt){const vt=dt[T.__cacheKey];vt.usedTimes--,vt.usedTimes===0&&w(U),Object.keys(dt).length===0&&y.delete(tt)}r.remove(U)}function w(U){const T=r.get(U);o.deleteTexture(T.__webglTexture);const tt=U.source,dt=y.get(tt);delete dt[T.__cacheKey],h.memory.textures--}function C(U){const T=r.get(U);if(U.depthTexture&&(U.depthTexture.dispose(),r.remove(U.depthTexture)),U.isWebGLCubeRenderTarget)for(let dt=0;dt<6;dt++){if(Array.isArray(T.__webglFramebuffer[dt]))for(let vt=0;vt<T.__webglFramebuffer[dt].length;vt++)o.deleteFramebuffer(T.__webglFramebuffer[dt][vt]);else o.deleteFramebuffer(T.__webglFramebuffer[dt]);T.__webglDepthbuffer&&o.deleteRenderbuffer(T.__webglDepthbuffer[dt])}else{if(Array.isArray(T.__webglFramebuffer))for(let dt=0;dt<T.__webglFramebuffer.length;dt++)o.deleteFramebuffer(T.__webglFramebuffer[dt]);else o.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&o.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&o.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let dt=0;dt<T.__webglColorRenderbuffer.length;dt++)T.__webglColorRenderbuffer[dt]&&o.deleteRenderbuffer(T.__webglColorRenderbuffer[dt]);T.__webglDepthRenderbuffer&&o.deleteRenderbuffer(T.__webglDepthRenderbuffer)}const tt=U.textures;for(let dt=0,vt=tt.length;dt<vt;dt++){const ft=r.get(tt[dt]);ft.__webglTexture&&(o.deleteTexture(ft.__webglTexture),h.memory.textures--),r.remove(tt[dt])}r.remove(U)}let V=0;function at(){V=0}function ut(){const U=V;return U>=u.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+U+" texture units while this GPU supports only "+u.maxTextures),V+=1,U}function _t(U){const T=[];return T.push(U.wrapS),T.push(U.wrapT),T.push(U.wrapR||0),T.push(U.magFilter),T.push(U.minFilter),T.push(U.anisotropy),T.push(U.internalFormat),T.push(U.format),T.push(U.type),T.push(U.generateMipmaps),T.push(U.premultiplyAlpha),T.push(U.flipY),T.push(U.unpackAlignment),T.push(U.colorSpace),T.join()}function lt(U,T){const tt=r.get(U);if(U.isVideoTexture&&re(U),U.isRenderTargetTexture===!1&&U.isExternalTexture!==!0&&U.version>0&&tt.__version!==U.version){const dt=U.image;if(dt===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(dt.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{J(tt,U,T);return}}else U.isExternalTexture&&(tt.__webglTexture=U.sourceTexture?U.sourceTexture:null);i.bindTexture(o.TEXTURE_2D,tt.__webglTexture,o.TEXTURE0+T)}function W(U,T){const tt=r.get(U);if(U.isRenderTargetTexture===!1&&U.version>0&&tt.__version!==U.version){J(tt,U,T);return}i.bindTexture(o.TEXTURE_2D_ARRAY,tt.__webglTexture,o.TEXTURE0+T)}function st(U,T){const tt=r.get(U);if(U.isRenderTargetTexture===!1&&U.version>0&&tt.__version!==U.version){J(tt,U,T);return}i.bindTexture(o.TEXTURE_3D,tt.__webglTexture,o.TEXTURE0+T)}function Z(U,T){const tt=r.get(U);if(U.version>0&&tt.__version!==U.version){it(tt,U,T);return}i.bindTexture(o.TEXTURE_CUBE_MAP,tt.__webglTexture,o.TEXTURE0+T)}const gt={[Qd]:o.REPEAT,[ks]:o.CLAMP_TO_EDGE,[Jd]:o.MIRRORED_REPEAT},St={[ui]:o.NEAREST,[fE]:o.NEAREST_MIPMAP_NEAREST,[qu]:o.NEAREST_MIPMAP_LINEAR,[ji]:o.LINEAR,[ld]:o.LINEAR_MIPMAP_NEAREST,[Ys]:o.LINEAR_MIPMAP_LINEAR},Ht={[mE]:o.NEVER,[xE]:o.ALWAYS,[_E]:o.LESS,[bS]:o.LEQUAL,[gE]:o.EQUAL,[yE]:o.GEQUAL,[vE]:o.GREATER,[SE]:o.NOTEQUAL};function se(U,T){if(T.type===Zi&&e.has("OES_texture_float_linear")===!1&&(T.magFilter===ji||T.magFilter===ld||T.magFilter===qu||T.magFilter===Ys||T.minFilter===ji||T.minFilter===ld||T.minFilter===qu||T.minFilter===Ys)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),o.texParameteri(U,o.TEXTURE_WRAP_S,gt[T.wrapS]),o.texParameteri(U,o.TEXTURE_WRAP_T,gt[T.wrapT]),(U===o.TEXTURE_3D||U===o.TEXTURE_2D_ARRAY)&&o.texParameteri(U,o.TEXTURE_WRAP_R,gt[T.wrapR]),o.texParameteri(U,o.TEXTURE_MAG_FILTER,St[T.magFilter]),o.texParameteri(U,o.TEXTURE_MIN_FILTER,St[T.minFilter]),T.compareFunction&&(o.texParameteri(U,o.TEXTURE_COMPARE_MODE,o.COMPARE_REF_TO_TEXTURE),o.texParameteri(U,o.TEXTURE_COMPARE_FUNC,Ht[T.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===ui||T.minFilter!==qu&&T.minFilter!==Ys||T.type===Zi&&e.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||r.get(T).__currentAnisotropy){const tt=e.get("EXT_texture_filter_anisotropic");o.texParameterf(U,tt.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,u.getMaxAnisotropy())),r.get(T).__currentAnisotropy=T.anisotropy}}}function Te(U,T){let tt=!1;U.__webglInit===void 0&&(U.__webglInit=!0,T.addEventListener("dispose",B));const dt=T.source;let vt=y.get(dt);vt===void 0&&(vt={},y.set(dt,vt));const ft=_t(T);if(ft!==U.__cacheKey){vt[ft]===void 0&&(vt[ft]={texture:o.createTexture(),usedTimes:0},h.memory.textures++,tt=!0),vt[ft].usedTimes++;const Vt=vt[U.__cacheKey];Vt!==void 0&&(vt[U.__cacheKey].usedTimes--,Vt.usedTimes===0&&w(T)),U.__cacheKey=ft,U.__webglTexture=vt[ft].texture}return tt}function I(U,T,tt){return Math.floor(Math.floor(U/tt)/T)}function ct(U,T,tt,dt){const ft=U.updateRanges;if(ft.length===0)i.texSubImage2D(o.TEXTURE_2D,0,0,0,T.width,T.height,tt,dt,T.data);else{ft.sort((Tt,Lt)=>Tt.start-Lt.start);let Vt=0;for(let Tt=1;Tt<ft.length;Tt++){const Lt=ft[Vt],ee=ft[Tt],jt=Lt.start+Lt.count,Ot=I(ee.start,T.width,4),ue=I(Lt.start,T.width,4);ee.start<=jt+1&&Ot===ue&&I(ee.start+ee.count-1,T.width,4)===Ot?Lt.count=Math.max(Lt.count,ee.start+ee.count-Lt.start):(++Vt,ft[Vt]=ee)}ft.length=Vt+1;const Rt=o.getParameter(o.UNPACK_ROW_LENGTH),Wt=o.getParameter(o.UNPACK_SKIP_PIXELS),Zt=o.getParameter(o.UNPACK_SKIP_ROWS);o.pixelStorei(o.UNPACK_ROW_LENGTH,T.width);for(let Tt=0,Lt=ft.length;Tt<Lt;Tt++){const ee=ft[Tt],jt=Math.floor(ee.start/4),Ot=Math.ceil(ee.count/4),ue=jt%T.width,G=Math.floor(jt/T.width),bt=Ot,wt=1;o.pixelStorei(o.UNPACK_SKIP_PIXELS,ue),o.pixelStorei(o.UNPACK_SKIP_ROWS,G),i.texSubImage2D(o.TEXTURE_2D,0,ue,G,bt,wt,tt,dt,T.data)}U.clearUpdateRanges(),o.pixelStorei(o.UNPACK_ROW_LENGTH,Rt),o.pixelStorei(o.UNPACK_SKIP_PIXELS,Wt),o.pixelStorei(o.UNPACK_SKIP_ROWS,Zt)}}function J(U,T,tt){let dt=o.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(dt=o.TEXTURE_2D_ARRAY),T.isData3DTexture&&(dt=o.TEXTURE_3D);const vt=Te(U,T),ft=T.source;i.bindTexture(dt,U.__webglTexture,o.TEXTURE0+tt);const Vt=r.get(ft);if(ft.version!==Vt.__version||vt===!0){i.activeTexture(o.TEXTURE0+tt);const Rt=we.getPrimaries(we.workingColorSpace),Wt=T.colorSpace===ss?null:we.getPrimaries(T.colorSpace),Zt=T.colorSpace===ss||Rt===Wt?o.NONE:o.BROWSER_DEFAULT_WEBGL;o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,T.flipY),o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),o.pixelStorei(o.UNPACK_ALIGNMENT,T.unpackAlignment),o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,Zt);let Tt=R(T.image,!1,u.maxTextureSize);Tt=ke(T,Tt);const Lt=f.convert(T.format,T.colorSpace),ee=f.convert(T.type);let jt=P(T.internalFormat,Lt,ee,T.colorSpace,T.isVideoTexture);se(dt,T);let Ot;const ue=T.mipmaps,G=T.isVideoTexture!==!0,bt=Vt.__version===void 0||vt===!0,wt=ft.dataReady,Gt=H(T,Tt);if(T.isDepthTexture)jt=D(T.format===_l,T.type),bt&&(G?i.texStorage2D(o.TEXTURE_2D,1,jt,Tt.width,Tt.height):i.texImage2D(o.TEXTURE_2D,0,jt,Tt.width,Tt.height,0,Lt,ee,null));else if(T.isDataTexture)if(ue.length>0){G&&bt&&i.texStorage2D(o.TEXTURE_2D,Gt,jt,ue[0].width,ue[0].height);for(let yt=0,mt=ue.length;yt<mt;yt++)Ot=ue[yt],G?wt&&i.texSubImage2D(o.TEXTURE_2D,yt,0,0,Ot.width,Ot.height,Lt,ee,Ot.data):i.texImage2D(o.TEXTURE_2D,yt,jt,Ot.width,Ot.height,0,Lt,ee,Ot.data);T.generateMipmaps=!1}else G?(bt&&i.texStorage2D(o.TEXTURE_2D,Gt,jt,Tt.width,Tt.height),wt&&ct(T,Tt,Lt,ee)):i.texImage2D(o.TEXTURE_2D,0,jt,Tt.width,Tt.height,0,Lt,ee,Tt.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){G&&bt&&i.texStorage3D(o.TEXTURE_2D_ARRAY,Gt,jt,ue[0].width,ue[0].height,Tt.depth);for(let yt=0,mt=ue.length;yt<mt;yt++)if(Ot=ue[yt],T.format!==Li)if(Lt!==null)if(G){if(wt)if(T.layerUpdates.size>0){const qt=Gv(Ot.width,Ot.height,T.format,T.type);for(const le of T.layerUpdates){const He=Ot.data.subarray(le*qt/Ot.data.BYTES_PER_ELEMENT,(le+1)*qt/Ot.data.BYTES_PER_ELEMENT);i.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY,yt,0,0,le,Ot.width,Ot.height,1,Lt,He)}T.clearLayerUpdates()}else i.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY,yt,0,0,0,Ot.width,Ot.height,Tt.depth,Lt,Ot.data)}else i.compressedTexImage3D(o.TEXTURE_2D_ARRAY,yt,jt,Ot.width,Ot.height,Tt.depth,0,Ot.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else G?wt&&i.texSubImage3D(o.TEXTURE_2D_ARRAY,yt,0,0,0,Ot.width,Ot.height,Tt.depth,Lt,ee,Ot.data):i.texImage3D(o.TEXTURE_2D_ARRAY,yt,jt,Ot.width,Ot.height,Tt.depth,0,Lt,ee,Ot.data)}else{G&&bt&&i.texStorage2D(o.TEXTURE_2D,Gt,jt,ue[0].width,ue[0].height);for(let yt=0,mt=ue.length;yt<mt;yt++)Ot=ue[yt],T.format!==Li?Lt!==null?G?wt&&i.compressedTexSubImage2D(o.TEXTURE_2D,yt,0,0,Ot.width,Ot.height,Lt,Ot.data):i.compressedTexImage2D(o.TEXTURE_2D,yt,jt,Ot.width,Ot.height,0,Ot.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):G?wt&&i.texSubImage2D(o.TEXTURE_2D,yt,0,0,Ot.width,Ot.height,Lt,ee,Ot.data):i.texImage2D(o.TEXTURE_2D,yt,jt,Ot.width,Ot.height,0,Lt,ee,Ot.data)}else if(T.isDataArrayTexture)if(G){if(bt&&i.texStorage3D(o.TEXTURE_2D_ARRAY,Gt,jt,Tt.width,Tt.height,Tt.depth),wt)if(T.layerUpdates.size>0){const yt=Gv(Tt.width,Tt.height,T.format,T.type);for(const mt of T.layerUpdates){const qt=Tt.data.subarray(mt*yt/Tt.data.BYTES_PER_ELEMENT,(mt+1)*yt/Tt.data.BYTES_PER_ELEMENT);i.texSubImage3D(o.TEXTURE_2D_ARRAY,0,0,0,mt,Tt.width,Tt.height,1,Lt,ee,qt)}T.clearLayerUpdates()}else i.texSubImage3D(o.TEXTURE_2D_ARRAY,0,0,0,0,Tt.width,Tt.height,Tt.depth,Lt,ee,Tt.data)}else i.texImage3D(o.TEXTURE_2D_ARRAY,0,jt,Tt.width,Tt.height,Tt.depth,0,Lt,ee,Tt.data);else if(T.isData3DTexture)G?(bt&&i.texStorage3D(o.TEXTURE_3D,Gt,jt,Tt.width,Tt.height,Tt.depth),wt&&i.texSubImage3D(o.TEXTURE_3D,0,0,0,0,Tt.width,Tt.height,Tt.depth,Lt,ee,Tt.data)):i.texImage3D(o.TEXTURE_3D,0,jt,Tt.width,Tt.height,Tt.depth,0,Lt,ee,Tt.data);else if(T.isFramebufferTexture){if(bt)if(G)i.texStorage2D(o.TEXTURE_2D,Gt,jt,Tt.width,Tt.height);else{let yt=Tt.width,mt=Tt.height;for(let qt=0;qt<Gt;qt++)i.texImage2D(o.TEXTURE_2D,qt,jt,yt,mt,0,Lt,ee,null),yt>>=1,mt>>=1}}else if(ue.length>0){if(G&&bt){const yt=qe(ue[0]);i.texStorage2D(o.TEXTURE_2D,Gt,jt,yt.width,yt.height)}for(let yt=0,mt=ue.length;yt<mt;yt++)Ot=ue[yt],G?wt&&i.texSubImage2D(o.TEXTURE_2D,yt,0,0,Lt,ee,Ot):i.texImage2D(o.TEXTURE_2D,yt,jt,Lt,ee,Ot);T.generateMipmaps=!1}else if(G){if(bt){const yt=qe(Tt);i.texStorage2D(o.TEXTURE_2D,Gt,jt,yt.width,yt.height)}wt&&i.texSubImage2D(o.TEXTURE_2D,0,0,0,Lt,ee,Tt)}else i.texImage2D(o.TEXTURE_2D,0,jt,Lt,ee,Tt);x(T)&&v(dt),Vt.__version=ft.version,T.onUpdate&&T.onUpdate(T)}U.__version=T.version}function it(U,T,tt){if(T.image.length!==6)return;const dt=Te(U,T),vt=T.source;i.bindTexture(o.TEXTURE_CUBE_MAP,U.__webglTexture,o.TEXTURE0+tt);const ft=r.get(vt);if(vt.version!==ft.__version||dt===!0){i.activeTexture(o.TEXTURE0+tt);const Vt=we.getPrimaries(we.workingColorSpace),Rt=T.colorSpace===ss?null:we.getPrimaries(T.colorSpace),Wt=T.colorSpace===ss||Vt===Rt?o.NONE:o.BROWSER_DEFAULT_WEBGL;o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,T.flipY),o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),o.pixelStorei(o.UNPACK_ALIGNMENT,T.unpackAlignment),o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,Wt);const Zt=T.isCompressedTexture||T.image[0].isCompressedTexture,Tt=T.image[0]&&T.image[0].isDataTexture,Lt=[];for(let mt=0;mt<6;mt++)!Zt&&!Tt?Lt[mt]=R(T.image[mt],!0,u.maxCubemapSize):Lt[mt]=Tt?T.image[mt].image:T.image[mt],Lt[mt]=ke(T,Lt[mt]);const ee=Lt[0],jt=f.convert(T.format,T.colorSpace),Ot=f.convert(T.type),ue=P(T.internalFormat,jt,Ot,T.colorSpace),G=T.isVideoTexture!==!0,bt=ft.__version===void 0||dt===!0,wt=vt.dataReady;let Gt=H(T,ee);se(o.TEXTURE_CUBE_MAP,T);let yt;if(Zt){G&&bt&&i.texStorage2D(o.TEXTURE_CUBE_MAP,Gt,ue,ee.width,ee.height);for(let mt=0;mt<6;mt++){yt=Lt[mt].mipmaps;for(let qt=0;qt<yt.length;qt++){const le=yt[qt];T.format!==Li?jt!==null?G?wt&&i.compressedTexSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,qt,0,0,le.width,le.height,jt,le.data):i.compressedTexImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,qt,ue,le.width,le.height,0,le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):G?wt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,qt,0,0,le.width,le.height,jt,Ot,le.data):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,qt,ue,le.width,le.height,0,jt,Ot,le.data)}}}else{if(yt=T.mipmaps,G&&bt){yt.length>0&&Gt++;const mt=qe(Lt[0]);i.texStorage2D(o.TEXTURE_CUBE_MAP,Gt,ue,mt.width,mt.height)}for(let mt=0;mt<6;mt++)if(Tt){G?wt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,0,0,Lt[mt].width,Lt[mt].height,jt,Ot,Lt[mt].data):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,ue,Lt[mt].width,Lt[mt].height,0,jt,Ot,Lt[mt].data);for(let qt=0;qt<yt.length;qt++){const He=yt[qt].image[mt].image;G?wt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,qt+1,0,0,He.width,He.height,jt,Ot,He.data):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,qt+1,ue,He.width,He.height,0,jt,Ot,He.data)}}else{G?wt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,0,0,jt,Ot,Lt[mt]):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,ue,jt,Ot,Lt[mt]);for(let qt=0;qt<yt.length;qt++){const le=yt[qt];G?wt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,qt+1,0,0,jt,Ot,le.image[mt]):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,qt+1,ue,jt,Ot,le.image[mt])}}}x(T)&&v(o.TEXTURE_CUBE_MAP),ft.__version=vt.version,T.onUpdate&&T.onUpdate(T)}U.__version=T.version}function xt(U,T,tt,dt,vt,ft){const Vt=f.convert(tt.format,tt.colorSpace),Rt=f.convert(tt.type),Wt=P(tt.internalFormat,Vt,Rt,tt.colorSpace),Zt=r.get(T),Tt=r.get(tt);if(Tt.__renderTarget=T,!Zt.__hasExternalTextures){const Lt=Math.max(1,T.width>>ft),ee=Math.max(1,T.height>>ft);vt===o.TEXTURE_3D||vt===o.TEXTURE_2D_ARRAY?i.texImage3D(vt,ft,Wt,Lt,ee,T.depth,0,Vt,Rt,null):i.texImage2D(vt,ft,Wt,Lt,ee,0,Vt,Rt,null)}i.bindFramebuffer(o.FRAMEBUFFER,U),Bt(T)?d.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,dt,vt,Tt.__webglTexture,0,ne(T)):(vt===o.TEXTURE_2D||vt>=o.TEXTURE_CUBE_MAP_POSITIVE_X&&vt<=o.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&o.framebufferTexture2D(o.FRAMEBUFFER,dt,vt,Tt.__webglTexture,ft),i.bindFramebuffer(o.FRAMEBUFFER,null)}function Ut(U,T,tt){if(o.bindRenderbuffer(o.RENDERBUFFER,U),T.depthBuffer){const dt=T.depthTexture,vt=dt&&dt.isDepthTexture?dt.type:null,ft=D(T.stencilBuffer,vt),Vt=T.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,Rt=ne(T);Bt(T)?d.renderbufferStorageMultisampleEXT(o.RENDERBUFFER,Rt,ft,T.width,T.height):tt?o.renderbufferStorageMultisample(o.RENDERBUFFER,Rt,ft,T.width,T.height):o.renderbufferStorage(o.RENDERBUFFER,ft,T.width,T.height),o.framebufferRenderbuffer(o.FRAMEBUFFER,Vt,o.RENDERBUFFER,U)}else{const dt=T.textures;for(let vt=0;vt<dt.length;vt++){const ft=dt[vt],Vt=f.convert(ft.format,ft.colorSpace),Rt=f.convert(ft.type),Wt=P(ft.internalFormat,Vt,Rt,ft.colorSpace),Zt=ne(T);tt&&Bt(T)===!1?o.renderbufferStorageMultisample(o.RENDERBUFFER,Zt,Wt,T.width,T.height):Bt(T)?d.renderbufferStorageMultisampleEXT(o.RENDERBUFFER,Zt,Wt,T.width,T.height):o.renderbufferStorage(o.RENDERBUFFER,Wt,T.width,T.height)}}o.bindRenderbuffer(o.RENDERBUFFER,null)}function At(U,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(i.bindFramebuffer(o.FRAMEBUFFER,U),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const dt=r.get(T.depthTexture);dt.__renderTarget=T,(!dt.__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),lt(T.depthTexture,0);const vt=dt.__webglTexture,ft=ne(T);if(T.depthTexture.format===ml)Bt(T)?d.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,o.DEPTH_ATTACHMENT,o.TEXTURE_2D,vt,0,ft):o.framebufferTexture2D(o.FRAMEBUFFER,o.DEPTH_ATTACHMENT,o.TEXTURE_2D,vt,0);else if(T.depthTexture.format===_l)Bt(T)?d.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,o.DEPTH_STENCIL_ATTACHMENT,o.TEXTURE_2D,vt,0,ft):o.framebufferTexture2D(o.FRAMEBUFFER,o.DEPTH_STENCIL_ATTACHMENT,o.TEXTURE_2D,vt,0);else throw new Error("Unknown depthTexture format")}function Mt(U){const T=r.get(U),tt=U.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==U.depthTexture){const dt=U.depthTexture;if(T.__depthDisposeCallback&&T.__depthDisposeCallback(),dt){const vt=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,dt.removeEventListener("dispose",vt)};dt.addEventListener("dispose",vt),T.__depthDisposeCallback=vt}T.__boundDepthTexture=dt}if(U.depthTexture&&!T.__autoAllocateDepthBuffer){if(tt)throw new Error("target.depthTexture not supported in Cube render targets");const dt=U.texture.mipmaps;dt&&dt.length>0?At(T.__webglFramebuffer[0],U):At(T.__webglFramebuffer,U)}else if(tt){T.__webglDepthbuffer=[];for(let dt=0;dt<6;dt++)if(i.bindFramebuffer(o.FRAMEBUFFER,T.__webglFramebuffer[dt]),T.__webglDepthbuffer[dt]===void 0)T.__webglDepthbuffer[dt]=o.createRenderbuffer(),Ut(T.__webglDepthbuffer[dt],U,!1);else{const vt=U.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,ft=T.__webglDepthbuffer[dt];o.bindRenderbuffer(o.RENDERBUFFER,ft),o.framebufferRenderbuffer(o.FRAMEBUFFER,vt,o.RENDERBUFFER,ft)}}else{const dt=U.texture.mipmaps;if(dt&&dt.length>0?i.bindFramebuffer(o.FRAMEBUFFER,T.__webglFramebuffer[0]):i.bindFramebuffer(o.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=o.createRenderbuffer(),Ut(T.__webglDepthbuffer,U,!1);else{const vt=U.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,ft=T.__webglDepthbuffer;o.bindRenderbuffer(o.RENDERBUFFER,ft),o.framebufferRenderbuffer(o.FRAMEBUFFER,vt,o.RENDERBUFFER,ft)}}i.bindFramebuffer(o.FRAMEBUFFER,null)}function Yt(U,T,tt){const dt=r.get(U);T!==void 0&&xt(dt.__webglFramebuffer,U,U.texture,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,0),tt!==void 0&&Mt(U)}function L(U){const T=U.texture,tt=r.get(U),dt=r.get(T);U.addEventListener("dispose",O);const vt=U.textures,ft=U.isWebGLCubeRenderTarget===!0,Vt=vt.length>1;if(Vt||(dt.__webglTexture===void 0&&(dt.__webglTexture=o.createTexture()),dt.__version=T.version,h.memory.textures++),ft){tt.__webglFramebuffer=[];for(let Rt=0;Rt<6;Rt++)if(T.mipmaps&&T.mipmaps.length>0){tt.__webglFramebuffer[Rt]=[];for(let Wt=0;Wt<T.mipmaps.length;Wt++)tt.__webglFramebuffer[Rt][Wt]=o.createFramebuffer()}else tt.__webglFramebuffer[Rt]=o.createFramebuffer()}else{if(T.mipmaps&&T.mipmaps.length>0){tt.__webglFramebuffer=[];for(let Rt=0;Rt<T.mipmaps.length;Rt++)tt.__webglFramebuffer[Rt]=o.createFramebuffer()}else tt.__webglFramebuffer=o.createFramebuffer();if(Vt)for(let Rt=0,Wt=vt.length;Rt<Wt;Rt++){const Zt=r.get(vt[Rt]);Zt.__webglTexture===void 0&&(Zt.__webglTexture=o.createTexture(),h.memory.textures++)}if(U.samples>0&&Bt(U)===!1){tt.__webglMultisampledFramebuffer=o.createFramebuffer(),tt.__webglColorRenderbuffer=[],i.bindFramebuffer(o.FRAMEBUFFER,tt.__webglMultisampledFramebuffer);for(let Rt=0;Rt<vt.length;Rt++){const Wt=vt[Rt];tt.__webglColorRenderbuffer[Rt]=o.createRenderbuffer(),o.bindRenderbuffer(o.RENDERBUFFER,tt.__webglColorRenderbuffer[Rt]);const Zt=f.convert(Wt.format,Wt.colorSpace),Tt=f.convert(Wt.type),Lt=P(Wt.internalFormat,Zt,Tt,Wt.colorSpace,U.isXRRenderTarget===!0),ee=ne(U);o.renderbufferStorageMultisample(o.RENDERBUFFER,ee,Lt,U.width,U.height),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+Rt,o.RENDERBUFFER,tt.__webglColorRenderbuffer[Rt])}o.bindRenderbuffer(o.RENDERBUFFER,null),U.depthBuffer&&(tt.__webglDepthRenderbuffer=o.createRenderbuffer(),Ut(tt.__webglDepthRenderbuffer,U,!0)),i.bindFramebuffer(o.FRAMEBUFFER,null)}}if(ft){i.bindTexture(o.TEXTURE_CUBE_MAP,dt.__webglTexture),se(o.TEXTURE_CUBE_MAP,T);for(let Rt=0;Rt<6;Rt++)if(T.mipmaps&&T.mipmaps.length>0)for(let Wt=0;Wt<T.mipmaps.length;Wt++)xt(tt.__webglFramebuffer[Rt][Wt],U,T,o.COLOR_ATTACHMENT0,o.TEXTURE_CUBE_MAP_POSITIVE_X+Rt,Wt);else xt(tt.__webglFramebuffer[Rt],U,T,o.COLOR_ATTACHMENT0,o.TEXTURE_CUBE_MAP_POSITIVE_X+Rt,0);x(T)&&v(o.TEXTURE_CUBE_MAP),i.unbindTexture()}else if(Vt){for(let Rt=0,Wt=vt.length;Rt<Wt;Rt++){const Zt=vt[Rt],Tt=r.get(Zt);let Lt=o.TEXTURE_2D;(U.isWebGL3DRenderTarget||U.isWebGLArrayRenderTarget)&&(Lt=U.isWebGL3DRenderTarget?o.TEXTURE_3D:o.TEXTURE_2D_ARRAY),i.bindTexture(Lt,Tt.__webglTexture),se(Lt,Zt),xt(tt.__webglFramebuffer,U,Zt,o.COLOR_ATTACHMENT0+Rt,Lt,0),x(Zt)&&v(Lt)}i.unbindTexture()}else{let Rt=o.TEXTURE_2D;if((U.isWebGL3DRenderTarget||U.isWebGLArrayRenderTarget)&&(Rt=U.isWebGL3DRenderTarget?o.TEXTURE_3D:o.TEXTURE_2D_ARRAY),i.bindTexture(Rt,dt.__webglTexture),se(Rt,T),T.mipmaps&&T.mipmaps.length>0)for(let Wt=0;Wt<T.mipmaps.length;Wt++)xt(tt.__webglFramebuffer[Wt],U,T,o.COLOR_ATTACHMENT0,Rt,Wt);else xt(tt.__webglFramebuffer,U,T,o.COLOR_ATTACHMENT0,Rt,0);x(T)&&v(Rt),i.unbindTexture()}U.depthBuffer&&Mt(U)}function Fe(U){const T=U.textures;for(let tt=0,dt=T.length;tt<dt;tt++){const vt=T[tt];if(x(vt)){const ft=z(U),Vt=r.get(vt).__webglTexture;i.bindTexture(ft,Vt),v(ft),i.unbindTexture()}}}const ae=[],Kt=[];function Nt(U){if(U.samples>0){if(Bt(U)===!1){const T=U.textures,tt=U.width,dt=U.height;let vt=o.COLOR_BUFFER_BIT;const ft=U.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,Vt=r.get(U),Rt=T.length>1;if(Rt)for(let Zt=0;Zt<T.length;Zt++)i.bindFramebuffer(o.FRAMEBUFFER,Vt.__webglMultisampledFramebuffer),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+Zt,o.RENDERBUFFER,null),i.bindFramebuffer(o.FRAMEBUFFER,Vt.__webglFramebuffer),o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0+Zt,o.TEXTURE_2D,null,0);i.bindFramebuffer(o.READ_FRAMEBUFFER,Vt.__webglMultisampledFramebuffer);const Wt=U.texture.mipmaps;Wt&&Wt.length>0?i.bindFramebuffer(o.DRAW_FRAMEBUFFER,Vt.__webglFramebuffer[0]):i.bindFramebuffer(o.DRAW_FRAMEBUFFER,Vt.__webglFramebuffer);for(let Zt=0;Zt<T.length;Zt++){if(U.resolveDepthBuffer&&(U.depthBuffer&&(vt|=o.DEPTH_BUFFER_BIT),U.stencilBuffer&&U.resolveStencilBuffer&&(vt|=o.STENCIL_BUFFER_BIT)),Rt){o.framebufferRenderbuffer(o.READ_FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.RENDERBUFFER,Vt.__webglColorRenderbuffer[Zt]);const Tt=r.get(T[Zt]).__webglTexture;o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,Tt,0)}o.blitFramebuffer(0,0,tt,dt,0,0,tt,dt,vt,o.NEAREST),g===!0&&(ae.length=0,Kt.length=0,ae.push(o.COLOR_ATTACHMENT0+Zt),U.depthBuffer&&U.resolveDepthBuffer===!1&&(ae.push(ft),Kt.push(ft),o.invalidateFramebuffer(o.DRAW_FRAMEBUFFER,Kt)),o.invalidateFramebuffer(o.READ_FRAMEBUFFER,ae))}if(i.bindFramebuffer(o.READ_FRAMEBUFFER,null),i.bindFramebuffer(o.DRAW_FRAMEBUFFER,null),Rt)for(let Zt=0;Zt<T.length;Zt++){i.bindFramebuffer(o.FRAMEBUFFER,Vt.__webglMultisampledFramebuffer),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+Zt,o.RENDERBUFFER,Vt.__webglColorRenderbuffer[Zt]);const Tt=r.get(T[Zt]).__webglTexture;i.bindFramebuffer(o.FRAMEBUFFER,Vt.__webglFramebuffer),o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0+Zt,o.TEXTURE_2D,Tt,0)}i.bindFramebuffer(o.DRAW_FRAMEBUFFER,Vt.__webglMultisampledFramebuffer)}else if(U.depthBuffer&&U.resolveDepthBuffer===!1&&g){const T=U.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT;o.invalidateFramebuffer(o.DRAW_FRAMEBUFFER,[T])}}}function ne(U){return Math.min(u.maxSamples,U.samples)}function Bt(U){const T=r.get(U);return U.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function re(U){const T=h.render.frame;S.get(U)!==T&&(S.set(U,T),U.update())}function ke(U,T){const tt=U.colorSpace,dt=U.format,vt=U.type;return U.isCompressedTexture===!0||U.isVideoTexture===!0||tt!==oo&&tt!==ss&&(we.getTransfer(tt)===Ve?(dt!==Li||vt!==Ji)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",tt)),T}function qe(U){return typeof HTMLImageElement<"u"&&U instanceof HTMLImageElement?(_.width=U.naturalWidth||U.width,_.height=U.naturalHeight||U.height):typeof VideoFrame<"u"&&U instanceof VideoFrame?(_.width=U.displayWidth,_.height=U.displayHeight):(_.width=U.width,_.height=U.height),_}this.allocateTextureUnit=ut,this.resetTextureUnits=at,this.setTexture2D=lt,this.setTexture2DArray=W,this.setTexture3D=st,this.setTextureCube=Z,this.rebindTextures=Yt,this.setupRenderTarget=L,this.updateRenderTargetMipmap=Fe,this.updateMultisampleRenderTarget=Nt,this.setupDepthRenderbuffer=Mt,this.setupFrameBufferTexture=xt,this.useMultisampledRTT=Bt}function eC(o,e){function i(r,u=ss){let f;const h=we.getTransfer(u);if(r===Ji)return o.UNSIGNED_BYTE;if(r===Lp)return o.UNSIGNED_SHORT_4_4_4_4;if(r===Op)return o.UNSIGNED_SHORT_5_5_5_1;if(r===SS)return o.UNSIGNED_INT_5_9_9_9_REV;if(r===yS)return o.UNSIGNED_INT_10F_11F_11F_REV;if(r===gS)return o.BYTE;if(r===vS)return o.SHORT;if(r===dl)return o.UNSIGNED_SHORT;if(r===Np)return o.INT;if(r===qs)return o.UNSIGNED_INT;if(r===Zi)return o.FLOAT;if(r===Sl)return o.HALF_FLOAT;if(r===xS)return o.ALPHA;if(r===MS)return o.RGB;if(r===Li)return o.RGBA;if(r===ml)return o.DEPTH_COMPONENT;if(r===_l)return o.DEPTH_STENCIL;if(r===Pp)return o.RED;if(r===zp)return o.RED_INTEGER;if(r===ES)return o.RG;if(r===Ip)return o.RG_INTEGER;if(r===Bp)return o.RGBA_INTEGER;if(r===_c||r===gc||r===vc||r===Sc)if(h===Ve)if(f=e.get("WEBGL_compressed_texture_s3tc_srgb"),f!==null){if(r===_c)return f.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===gc)return f.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===vc)return f.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Sc)return f.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(f=e.get("WEBGL_compressed_texture_s3tc"),f!==null){if(r===_c)return f.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===gc)return f.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===vc)return f.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Sc)return f.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===$d||r===tp||r===ep||r===np)if(f=e.get("WEBGL_compressed_texture_pvrtc"),f!==null){if(r===$d)return f.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===tp)return f.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===ep)return f.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===np)return f.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===ip||r===ap||r===sp)if(f=e.get("WEBGL_compressed_texture_etc"),f!==null){if(r===ip||r===ap)return h===Ve?f.COMPRESSED_SRGB8_ETC2:f.COMPRESSED_RGB8_ETC2;if(r===sp)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:f.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===rp||r===op||r===lp||r===up||r===cp||r===fp||r===hp||r===dp||r===pp||r===mp||r===_p||r===gp||r===vp||r===Sp)if(f=e.get("WEBGL_compressed_texture_astc"),f!==null){if(r===rp)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:f.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===op)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:f.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===lp)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:f.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===up)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:f.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===cp)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:f.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===fp)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:f.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===hp)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:f.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===dp)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:f.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===pp)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:f.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===mp)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:f.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===_p)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:f.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===gp)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:f.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===vp)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:f.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===Sp)return h===Ve?f.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:f.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===yp||r===xp||r===Mp)if(f=e.get("EXT_texture_compression_bptc"),f!==null){if(r===yp)return h===Ve?f.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:f.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===xp)return f.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===Mp)return f.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===Ep||r===Tp||r===bp||r===Ap)if(f=e.get("EXT_texture_compression_rgtc"),f!==null){if(r===Ep)return f.COMPRESSED_RED_RGTC1_EXT;if(r===Tp)return f.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===bp)return f.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Ap)return f.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===pl?o.UNSIGNED_INT_24_8:o[r]!==void 0?o[r]:null}return{convert:i}}const nC=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,iC=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class aC{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,i){if(this.texture===null){const r=new PS(e.texture);(e.depthNear!==i.depthNear||e.depthFar!==i.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const i=e.cameras[0].viewport,r=new us({vertexShader:nC,fragmentShader:iC,uniforms:{depthColor:{value:this.texture},depthWidth:{value:i.z},depthHeight:{value:i.w}}});this.mesh=new Mi(new Rc(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class sC extends Zs{constructor(e,i){super();const r=this;let u=null,f=1,h=null,d="local-floor",g=1,_=null,S=null,m=null,y=null,M=null,A=null;const R=typeof XRWebGLBinding<"u",x=new aC,v={},z=i.getContextAttributes();let P=null,D=null;const H=[],B=[],O=new ce;let k=null;const w=new xi;w.viewport=new sn;const C=new xi;C.viewport=new sn;const V=[w,C],at=new TT;let ut=null,_t=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let it=H[J];return it===void 0&&(it=new wd,H[J]=it),it.getTargetRaySpace()},this.getControllerGrip=function(J){let it=H[J];return it===void 0&&(it=new wd,H[J]=it),it.getGripSpace()},this.getHand=function(J){let it=H[J];return it===void 0&&(it=new wd,H[J]=it),it.getHandSpace()};function lt(J){const it=B.indexOf(J.inputSource);if(it===-1)return;const xt=H[it];xt!==void 0&&(xt.update(J.inputSource,J.frame,_||h),xt.dispatchEvent({type:J.type,data:J.inputSource}))}function W(){u.removeEventListener("select",lt),u.removeEventListener("selectstart",lt),u.removeEventListener("selectend",lt),u.removeEventListener("squeeze",lt),u.removeEventListener("squeezestart",lt),u.removeEventListener("squeezeend",lt),u.removeEventListener("end",W),u.removeEventListener("inputsourceschange",st);for(let J=0;J<H.length;J++){const it=B[J];it!==null&&(B[J]=null,H[J].disconnect(it))}ut=null,_t=null,x.reset();for(const J in v)delete v[J];e.setRenderTarget(P),M=null,y=null,m=null,u=null,D=null,ct.stop(),r.isPresenting=!1,e.setPixelRatio(k),e.setSize(O.width,O.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){f=J,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){d=J,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return _||h},this.setReferenceSpace=function(J){_=J},this.getBaseLayer=function(){return y!==null?y:M},this.getBinding=function(){return m===null&&R&&(m=new XRWebGLBinding(u,i)),m},this.getFrame=function(){return A},this.getSession=function(){return u},this.setSession=async function(J){if(u=J,u!==null){if(P=e.getRenderTarget(),u.addEventListener("select",lt),u.addEventListener("selectstart",lt),u.addEventListener("selectend",lt),u.addEventListener("squeeze",lt),u.addEventListener("squeezestart",lt),u.addEventListener("squeezeend",lt),u.addEventListener("end",W),u.addEventListener("inputsourceschange",st),z.xrCompatible!==!0&&await i.makeXRCompatible(),k=e.getPixelRatio(),e.getSize(O),R&&"createProjectionLayer"in XRWebGLBinding.prototype){let xt=null,Ut=null,At=null;z.depth&&(At=z.stencil?i.DEPTH24_STENCIL8:i.DEPTH_COMPONENT24,xt=z.stencil?_l:ml,Ut=z.stencil?pl:qs);const Mt={colorFormat:i.RGBA8,depthFormat:At,scaleFactor:f};m=this.getBinding(),y=m.createProjectionLayer(Mt),u.updateRenderState({layers:[y]}),e.setPixelRatio(1),e.setSize(y.textureWidth,y.textureHeight,!1),D=new js(y.textureWidth,y.textureHeight,{format:Li,type:Ji,depthTexture:new OS(y.textureWidth,y.textureHeight,Ut,void 0,void 0,void 0,void 0,void 0,void 0,xt),stencilBuffer:z.stencil,colorSpace:e.outputColorSpace,samples:z.antialias?4:0,resolveDepthBuffer:y.ignoreDepthValues===!1,resolveStencilBuffer:y.ignoreDepthValues===!1})}else{const xt={antialias:z.antialias,alpha:!0,depth:z.depth,stencil:z.stencil,framebufferScaleFactor:f};M=new XRWebGLLayer(u,i,xt),u.updateRenderState({baseLayer:M}),e.setPixelRatio(1),e.setSize(M.framebufferWidth,M.framebufferHeight,!1),D=new js(M.framebufferWidth,M.framebufferHeight,{format:Li,type:Ji,colorSpace:e.outputColorSpace,stencilBuffer:z.stencil,resolveDepthBuffer:M.ignoreDepthValues===!1,resolveStencilBuffer:M.ignoreDepthValues===!1})}D.isXRRenderTarget=!0,this.setFoveation(g),_=null,h=await u.requestReferenceSpace(d),ct.setContext(u),ct.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(u!==null)return u.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function st(J){for(let it=0;it<J.removed.length;it++){const xt=J.removed[it],Ut=B.indexOf(xt);Ut>=0&&(B[Ut]=null,H[Ut].disconnect(xt))}for(let it=0;it<J.added.length;it++){const xt=J.added[it];let Ut=B.indexOf(xt);if(Ut===-1){for(let Mt=0;Mt<H.length;Mt++)if(Mt>=B.length){B.push(xt),Ut=Mt;break}else if(B[Mt]===null){B[Mt]=xt,Ut=Mt;break}if(Ut===-1)break}const At=H[Ut];At&&At.connect(xt)}}const Z=new nt,gt=new nt;function St(J,it,xt){Z.setFromMatrixPosition(it.matrixWorld),gt.setFromMatrixPosition(xt.matrixWorld);const Ut=Z.distanceTo(gt),At=it.projectionMatrix.elements,Mt=xt.projectionMatrix.elements,Yt=At[14]/(At[10]-1),L=At[14]/(At[10]+1),Fe=(At[9]+1)/At[5],ae=(At[9]-1)/At[5],Kt=(At[8]-1)/At[0],Nt=(Mt[8]+1)/Mt[0],ne=Yt*Kt,Bt=Yt*Nt,re=Ut/(-Kt+Nt),ke=re*-Kt;if(it.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(ke),J.translateZ(re),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),At[10]===-1)J.projectionMatrix.copy(it.projectionMatrix),J.projectionMatrixInverse.copy(it.projectionMatrixInverse);else{const qe=Yt+re,U=L+re,T=ne-ke,tt=Bt+(Ut-ke),dt=Fe*L/U*qe,vt=ae*L/U*qe;J.projectionMatrix.makePerspective(T,tt,dt,vt,qe,U),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function Ht(J,it){it===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(it.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(u===null)return;let it=J.near,xt=J.far;x.texture!==null&&(x.depthNear>0&&(it=x.depthNear),x.depthFar>0&&(xt=x.depthFar)),at.near=C.near=w.near=it,at.far=C.far=w.far=xt,(ut!==at.near||_t!==at.far)&&(u.updateRenderState({depthNear:at.near,depthFar:at.far}),ut=at.near,_t=at.far),at.layers.mask=J.layers.mask|6,w.layers.mask=at.layers.mask&3,C.layers.mask=at.layers.mask&5;const Ut=J.parent,At=at.cameras;Ht(at,Ut);for(let Mt=0;Mt<At.length;Mt++)Ht(At[Mt],Ut);At.length===2?St(at,w,C):at.projectionMatrix.copy(w.projectionMatrix),se(J,at,Ut)};function se(J,it,xt){xt===null?J.matrix.copy(it.matrixWorld):(J.matrix.copy(xt.matrixWorld),J.matrix.invert(),J.matrix.multiply(it.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(it.projectionMatrix),J.projectionMatrixInverse.copy(it.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=gl*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return at},this.getFoveation=function(){if(!(y===null&&M===null))return g},this.setFoveation=function(J){g=J,y!==null&&(y.fixedFoveation=J),M!==null&&M.fixedFoveation!==void 0&&(M.fixedFoveation=J)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(at)},this.getCameraTexture=function(J){return v[J]};let Te=null;function I(J,it){if(S=it.getViewerPose(_||h),A=it,S!==null){const xt=S.views;M!==null&&(e.setRenderTargetFramebuffer(D,M.framebuffer),e.setRenderTarget(D));let Ut=!1;xt.length!==at.cameras.length&&(at.cameras.length=0,Ut=!0);for(let L=0;L<xt.length;L++){const Fe=xt[L];let ae=null;if(M!==null)ae=M.getViewport(Fe);else{const Nt=m.getViewSubImage(y,Fe);ae=Nt.viewport,L===0&&(e.setRenderTargetTextures(D,Nt.colorTexture,Nt.depthStencilTexture),e.setRenderTarget(D))}let Kt=V[L];Kt===void 0&&(Kt=new xi,Kt.layers.enable(L),Kt.viewport=new sn,V[L]=Kt),Kt.matrix.fromArray(Fe.transform.matrix),Kt.matrix.decompose(Kt.position,Kt.quaternion,Kt.scale),Kt.projectionMatrix.fromArray(Fe.projectionMatrix),Kt.projectionMatrixInverse.copy(Kt.projectionMatrix).invert(),Kt.viewport.set(ae.x,ae.y,ae.width,ae.height),L===0&&(at.matrix.copy(Kt.matrix),at.matrix.decompose(at.position,at.quaternion,at.scale)),Ut===!0&&at.cameras.push(Kt)}const At=u.enabledFeatures;if(At&&At.includes("depth-sensing")&&u.depthUsage=="gpu-optimized"&&R){m=r.getBinding();const L=m.getDepthInformation(xt[0]);L&&L.isValid&&L.texture&&x.init(L,u.renderState)}if(At&&At.includes("camera-access")&&R){e.state.unbindTexture(),m=r.getBinding();for(let L=0;L<xt.length;L++){const Fe=xt[L].camera;if(Fe){let ae=v[Fe];ae||(ae=new PS,v[Fe]=ae);const Kt=m.getCameraImage(Fe);ae.sourceTexture=Kt}}}}for(let xt=0;xt<H.length;xt++){const Ut=B[xt],At=H[xt];Ut!==null&&At!==void 0&&At.update(Ut,it,_||h)}Te&&Te(J,it),it.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:it}),A=null}const ct=new BS;ct.setAnimationLoop(I),this.setAnimationLoop=function(J){Te=J},this.dispose=function(){}}}const Hs=new $i,rC=new Ke;function oC(o,e){function i(x,v){x.matrixAutoUpdate===!0&&x.updateMatrix(),v.value.copy(x.matrix)}function r(x,v){v.color.getRGB(x.fogColor.value,US(o)),v.isFog?(x.fogNear.value=v.near,x.fogFar.value=v.far):v.isFogExp2&&(x.fogDensity.value=v.density)}function u(x,v,z,P,D){v.isMeshBasicMaterial||v.isMeshLambertMaterial?f(x,v):v.isMeshToonMaterial?(f(x,v),m(x,v)):v.isMeshPhongMaterial?(f(x,v),S(x,v)):v.isMeshStandardMaterial?(f(x,v),y(x,v),v.isMeshPhysicalMaterial&&M(x,v,D)):v.isMeshMatcapMaterial?(f(x,v),A(x,v)):v.isMeshDepthMaterial?f(x,v):v.isMeshDistanceMaterial?(f(x,v),R(x,v)):v.isMeshNormalMaterial?f(x,v):v.isLineBasicMaterial?(h(x,v),v.isLineDashedMaterial&&d(x,v)):v.isPointsMaterial?g(x,v,z,P):v.isSpriteMaterial?_(x,v):v.isShadowMaterial?(x.color.value.copy(v.color),x.opacity.value=v.opacity):v.isShaderMaterial&&(v.uniformsNeedUpdate=!1)}function f(x,v){x.opacity.value=v.opacity,v.color&&x.diffuse.value.copy(v.color),v.emissive&&x.emissive.value.copy(v.emissive).multiplyScalar(v.emissiveIntensity),v.map&&(x.map.value=v.map,i(v.map,x.mapTransform)),v.alphaMap&&(x.alphaMap.value=v.alphaMap,i(v.alphaMap,x.alphaMapTransform)),v.bumpMap&&(x.bumpMap.value=v.bumpMap,i(v.bumpMap,x.bumpMapTransform),x.bumpScale.value=v.bumpScale,v.side===Kn&&(x.bumpScale.value*=-1)),v.normalMap&&(x.normalMap.value=v.normalMap,i(v.normalMap,x.normalMapTransform),x.normalScale.value.copy(v.normalScale),v.side===Kn&&x.normalScale.value.negate()),v.displacementMap&&(x.displacementMap.value=v.displacementMap,i(v.displacementMap,x.displacementMapTransform),x.displacementScale.value=v.displacementScale,x.displacementBias.value=v.displacementBias),v.emissiveMap&&(x.emissiveMap.value=v.emissiveMap,i(v.emissiveMap,x.emissiveMapTransform)),v.specularMap&&(x.specularMap.value=v.specularMap,i(v.specularMap,x.specularMapTransform)),v.alphaTest>0&&(x.alphaTest.value=v.alphaTest);const z=e.get(v),P=z.envMap,D=z.envMapRotation;P&&(x.envMap.value=P,Hs.copy(D),Hs.x*=-1,Hs.y*=-1,Hs.z*=-1,P.isCubeTexture&&P.isRenderTargetTexture===!1&&(Hs.y*=-1,Hs.z*=-1),x.envMapRotation.value.setFromMatrix4(rC.makeRotationFromEuler(Hs)),x.flipEnvMap.value=P.isCubeTexture&&P.isRenderTargetTexture===!1?-1:1,x.reflectivity.value=v.reflectivity,x.ior.value=v.ior,x.refractionRatio.value=v.refractionRatio),v.lightMap&&(x.lightMap.value=v.lightMap,x.lightMapIntensity.value=v.lightMapIntensity,i(v.lightMap,x.lightMapTransform)),v.aoMap&&(x.aoMap.value=v.aoMap,x.aoMapIntensity.value=v.aoMapIntensity,i(v.aoMap,x.aoMapTransform))}function h(x,v){x.diffuse.value.copy(v.color),x.opacity.value=v.opacity,v.map&&(x.map.value=v.map,i(v.map,x.mapTransform))}function d(x,v){x.dashSize.value=v.dashSize,x.totalSize.value=v.dashSize+v.gapSize,x.scale.value=v.scale}function g(x,v,z,P){x.diffuse.value.copy(v.color),x.opacity.value=v.opacity,x.size.value=v.size*z,x.scale.value=P*.5,v.map&&(x.map.value=v.map,i(v.map,x.uvTransform)),v.alphaMap&&(x.alphaMap.value=v.alphaMap,i(v.alphaMap,x.alphaMapTransform)),v.alphaTest>0&&(x.alphaTest.value=v.alphaTest)}function _(x,v){x.diffuse.value.copy(v.color),x.opacity.value=v.opacity,x.rotation.value=v.rotation,v.map&&(x.map.value=v.map,i(v.map,x.mapTransform)),v.alphaMap&&(x.alphaMap.value=v.alphaMap,i(v.alphaMap,x.alphaMapTransform)),v.alphaTest>0&&(x.alphaTest.value=v.alphaTest)}function S(x,v){x.specular.value.copy(v.specular),x.shininess.value=Math.max(v.shininess,1e-4)}function m(x,v){v.gradientMap&&(x.gradientMap.value=v.gradientMap)}function y(x,v){x.metalness.value=v.metalness,v.metalnessMap&&(x.metalnessMap.value=v.metalnessMap,i(v.metalnessMap,x.metalnessMapTransform)),x.roughness.value=v.roughness,v.roughnessMap&&(x.roughnessMap.value=v.roughnessMap,i(v.roughnessMap,x.roughnessMapTransform)),v.envMap&&(x.envMapIntensity.value=v.envMapIntensity)}function M(x,v,z){x.ior.value=v.ior,v.sheen>0&&(x.sheenColor.value.copy(v.sheenColor).multiplyScalar(v.sheen),x.sheenRoughness.value=v.sheenRoughness,v.sheenColorMap&&(x.sheenColorMap.value=v.sheenColorMap,i(v.sheenColorMap,x.sheenColorMapTransform)),v.sheenRoughnessMap&&(x.sheenRoughnessMap.value=v.sheenRoughnessMap,i(v.sheenRoughnessMap,x.sheenRoughnessMapTransform))),v.clearcoat>0&&(x.clearcoat.value=v.clearcoat,x.clearcoatRoughness.value=v.clearcoatRoughness,v.clearcoatMap&&(x.clearcoatMap.value=v.clearcoatMap,i(v.clearcoatMap,x.clearcoatMapTransform)),v.clearcoatRoughnessMap&&(x.clearcoatRoughnessMap.value=v.clearcoatRoughnessMap,i(v.clearcoatRoughnessMap,x.clearcoatRoughnessMapTransform)),v.clearcoatNormalMap&&(x.clearcoatNormalMap.value=v.clearcoatNormalMap,i(v.clearcoatNormalMap,x.clearcoatNormalMapTransform),x.clearcoatNormalScale.value.copy(v.clearcoatNormalScale),v.side===Kn&&x.clearcoatNormalScale.value.negate())),v.dispersion>0&&(x.dispersion.value=v.dispersion),v.iridescence>0&&(x.iridescence.value=v.iridescence,x.iridescenceIOR.value=v.iridescenceIOR,x.iridescenceThicknessMinimum.value=v.iridescenceThicknessRange[0],x.iridescenceThicknessMaximum.value=v.iridescenceThicknessRange[1],v.iridescenceMap&&(x.iridescenceMap.value=v.iridescenceMap,i(v.iridescenceMap,x.iridescenceMapTransform)),v.iridescenceThicknessMap&&(x.iridescenceThicknessMap.value=v.iridescenceThicknessMap,i(v.iridescenceThicknessMap,x.iridescenceThicknessMapTransform))),v.transmission>0&&(x.transmission.value=v.transmission,x.transmissionSamplerMap.value=z.texture,x.transmissionSamplerSize.value.set(z.width,z.height),v.transmissionMap&&(x.transmissionMap.value=v.transmissionMap,i(v.transmissionMap,x.transmissionMapTransform)),x.thickness.value=v.thickness,v.thicknessMap&&(x.thicknessMap.value=v.thicknessMap,i(v.thicknessMap,x.thicknessMapTransform)),x.attenuationDistance.value=v.attenuationDistance,x.attenuationColor.value.copy(v.attenuationColor)),v.anisotropy>0&&(x.anisotropyVector.value.set(v.anisotropy*Math.cos(v.anisotropyRotation),v.anisotropy*Math.sin(v.anisotropyRotation)),v.anisotropyMap&&(x.anisotropyMap.value=v.anisotropyMap,i(v.anisotropyMap,x.anisotropyMapTransform))),x.specularIntensity.value=v.specularIntensity,x.specularColor.value.copy(v.specularColor),v.specularColorMap&&(x.specularColorMap.value=v.specularColorMap,i(v.specularColorMap,x.specularColorMapTransform)),v.specularIntensityMap&&(x.specularIntensityMap.value=v.specularIntensityMap,i(v.specularIntensityMap,x.specularIntensityMapTransform))}function A(x,v){v.matcap&&(x.matcap.value=v.matcap)}function R(x,v){const z=e.get(v).light;x.referencePosition.value.setFromMatrixPosition(z.matrixWorld),x.nearDistance.value=z.shadow.camera.near,x.farDistance.value=z.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:u}}function lC(o,e,i,r){let u={},f={},h=[];const d=o.getParameter(o.MAX_UNIFORM_BUFFER_BINDINGS);function g(z,P){const D=P.program;r.uniformBlockBinding(z,D)}function _(z,P){let D=u[z.id];D===void 0&&(A(z),D=S(z),u[z.id]=D,z.addEventListener("dispose",x));const H=P.program;r.updateUBOMapping(z,H);const B=e.render.frame;f[z.id]!==B&&(y(z),f[z.id]=B)}function S(z){const P=m();z.__bindingPointIndex=P;const D=o.createBuffer(),H=z.__size,B=z.usage;return o.bindBuffer(o.UNIFORM_BUFFER,D),o.bufferData(o.UNIFORM_BUFFER,H,B),o.bindBuffer(o.UNIFORM_BUFFER,null),o.bindBufferBase(o.UNIFORM_BUFFER,P,D),D}function m(){for(let z=0;z<d;z++)if(h.indexOf(z)===-1)return h.push(z),z;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function y(z){const P=u[z.id],D=z.uniforms,H=z.__cache;o.bindBuffer(o.UNIFORM_BUFFER,P);for(let B=0,O=D.length;B<O;B++){const k=Array.isArray(D[B])?D[B]:[D[B]];for(let w=0,C=k.length;w<C;w++){const V=k[w];if(M(V,B,w,H)===!0){const at=V.__offset,ut=Array.isArray(V.value)?V.value:[V.value];let _t=0;for(let lt=0;lt<ut.length;lt++){const W=ut[lt],st=R(W);typeof W=="number"||typeof W=="boolean"?(V.__data[0]=W,o.bufferSubData(o.UNIFORM_BUFFER,at+_t,V.__data)):W.isMatrix3?(V.__data[0]=W.elements[0],V.__data[1]=W.elements[1],V.__data[2]=W.elements[2],V.__data[3]=0,V.__data[4]=W.elements[3],V.__data[5]=W.elements[4],V.__data[6]=W.elements[5],V.__data[7]=0,V.__data[8]=W.elements[6],V.__data[9]=W.elements[7],V.__data[10]=W.elements[8],V.__data[11]=0):(W.toArray(V.__data,_t),_t+=st.storage/Float32Array.BYTES_PER_ELEMENT)}o.bufferSubData(o.UNIFORM_BUFFER,at,V.__data)}}}o.bindBuffer(o.UNIFORM_BUFFER,null)}function M(z,P,D,H){const B=z.value,O=P+"_"+D;if(H[O]===void 0)return typeof B=="number"||typeof B=="boolean"?H[O]=B:H[O]=B.clone(),!0;{const k=H[O];if(typeof B=="number"||typeof B=="boolean"){if(k!==B)return H[O]=B,!0}else if(k.equals(B)===!1)return k.copy(B),!0}return!1}function A(z){const P=z.uniforms;let D=0;const H=16;for(let O=0,k=P.length;O<k;O++){const w=Array.isArray(P[O])?P[O]:[P[O]];for(let C=0,V=w.length;C<V;C++){const at=w[C],ut=Array.isArray(at.value)?at.value:[at.value];for(let _t=0,lt=ut.length;_t<lt;_t++){const W=ut[_t],st=R(W),Z=D%H,gt=Z%st.boundary,St=Z+gt;D+=gt,St!==0&&H-St<st.storage&&(D+=H-St),at.__data=new Float32Array(st.storage/Float32Array.BYTES_PER_ELEMENT),at.__offset=D,D+=st.storage}}}const B=D%H;return B>0&&(D+=H-B),z.__size=D,z.__cache={},this}function R(z){const P={boundary:0,storage:0};return typeof z=="number"||typeof z=="boolean"?(P.boundary=4,P.storage=4):z.isVector2?(P.boundary=8,P.storage=8):z.isVector3||z.isColor?(P.boundary=16,P.storage=12):z.isVector4?(P.boundary=16,P.storage=16):z.isMatrix3?(P.boundary=48,P.storage=48):z.isMatrix4?(P.boundary=64,P.storage=64):z.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",z),P}function x(z){const P=z.target;P.removeEventListener("dispose",x);const D=h.indexOf(P.__bindingPointIndex);h.splice(D,1),o.deleteBuffer(u[P.id]),delete u[P.id],delete f[P.id]}function v(){for(const z in u)o.deleteBuffer(u[z]);h=[],u={},f={}}return{bind:g,update:_,dispose:v}}class uC{constructor(e={}){const{canvas:i=BE(),context:r=null,depth:u=!0,stencil:f=!1,alpha:h=!1,antialias:d=!1,premultipliedAlpha:g=!0,preserveDrawingBuffer:_=!1,powerPreference:S="default",failIfMajorPerformanceCaveat:m=!1,reversedDepthBuffer:y=!1}=e;this.isWebGLRenderer=!0;let M;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");M=r.getContextAttributes().alpha}else M=h;const A=new Uint32Array(4),R=new Int32Array(4);let x=null,v=null;const z=[],P=[];this.domElement=i,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=os,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const D=this;let H=!1;this._outputColorSpace=li;let B=0,O=0,k=null,w=-1,C=null;const V=new sn,at=new sn;let ut=null;const _t=new De(0);let lt=0,W=i.width,st=i.height,Z=1,gt=null,St=null;const Ht=new sn(0,0,W,st),se=new sn(0,0,W,st);let Te=!1;const I=new kp;let ct=!1,J=!1;const it=new Ke,xt=new nt,Ut=new sn,At={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Mt=!1;function Yt(){return k===null?Z:1}let L=r;function Fe(b,j){return i.getContext(b,j)}try{const b={alpha:!0,depth:u,stencil:f,antialias:d,premultipliedAlpha:g,preserveDrawingBuffer:_,powerPreference:S,failIfMajorPerformanceCaveat:m};if("setAttribute"in i&&i.setAttribute("data-engine",`three.js r${Up}`),i.addEventListener("webglcontextlost",wt,!1),i.addEventListener("webglcontextrestored",Gt,!1),i.addEventListener("webglcontextcreationerror",yt,!1),L===null){const j="webgl2";if(L=Fe(j,b),L===null)throw Fe(j)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let ae,Kt,Nt,ne,Bt,re,ke,qe,U,T,tt,dt,vt,ft,Vt,Rt,Wt,Zt,Tt,Lt,ee,jt,Ot,ue;function G(){ae=new S1(L),ae.init(),jt=new eC(L,ae),Kt=new h1(L,ae,e,jt),Nt=new $R(L,ae),Kt.reversedDepthBuffer&&y&&Nt.buffers.depth.setReversed(!0),ne=new M1(L),Bt=new HR,re=new tC(L,ae,Nt,Bt,Kt,jt,ne),ke=new p1(D),qe=new v1(D),U=new CT(L),Ot=new c1(L,U),T=new y1(L,U,ne,Ot),tt=new T1(L,T,U,ne),Tt=new E1(L,Kt,re),Rt=new d1(Bt),dt=new FR(D,ke,qe,ae,Kt,Ot,Rt),vt=new oC(D,Bt),ft=new VR,Vt=new jR(ae),Zt=new u1(D,ke,qe,Nt,tt,M,g),Wt=new QR(D,tt,Kt),ue=new lC(L,ne,Kt,Nt),Lt=new f1(L,ae,ne),ee=new x1(L,ae,ne),ne.programs=dt.programs,D.capabilities=Kt,D.extensions=ae,D.properties=Bt,D.renderLists=ft,D.shadowMap=Wt,D.state=Nt,D.info=ne}G();const bt=new sC(D,L);this.xr=bt,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const b=ae.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=ae.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(b){b!==void 0&&(Z=b,this.setSize(W,st,!1))},this.getSize=function(b){return b.set(W,st)},this.setSize=function(b,j,rt=!0){if(bt.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}W=b,st=j,i.width=Math.floor(b*Z),i.height=Math.floor(j*Z),rt===!0&&(i.style.width=b+"px",i.style.height=j+"px"),this.setViewport(0,0,b,j)},this.getDrawingBufferSize=function(b){return b.set(W*Z,st*Z).floor()},this.setDrawingBufferSize=function(b,j,rt){W=b,st=j,Z=rt,i.width=Math.floor(b*rt),i.height=Math.floor(j*rt),this.setViewport(0,0,b,j)},this.getCurrentViewport=function(b){return b.copy(V)},this.getViewport=function(b){return b.copy(Ht)},this.setViewport=function(b,j,rt,ot){b.isVector4?Ht.set(b.x,b.y,b.z,b.w):Ht.set(b,j,rt,ot),Nt.viewport(V.copy(Ht).multiplyScalar(Z).round())},this.getScissor=function(b){return b.copy(se)},this.setScissor=function(b,j,rt,ot){b.isVector4?se.set(b.x,b.y,b.z,b.w):se.set(b,j,rt,ot),Nt.scissor(at.copy(se).multiplyScalar(Z).round())},this.getScissorTest=function(){return Te},this.setScissorTest=function(b){Nt.setScissorTest(Te=b)},this.setOpaqueSort=function(b){gt=b},this.setTransparentSort=function(b){St=b},this.getClearColor=function(b){return b.copy(Zt.getClearColor())},this.setClearColor=function(){Zt.setClearColor(...arguments)},this.getClearAlpha=function(){return Zt.getClearAlpha()},this.setClearAlpha=function(){Zt.setClearAlpha(...arguments)},this.clear=function(b=!0,j=!0,rt=!0){let ot=0;if(b){let K=!1;if(k!==null){const Et=k.texture.format;K=Et===Bp||Et===Ip||Et===zp}if(K){const Et=k.texture.type,Pt=Et===Ji||Et===qs||Et===dl||Et===pl||Et===Lp||Et===Op,It=Zt.getClearColor(),Ct=Zt.getClearAlpha(),Xt=It.r,te=It.g,Jt=It.b;Pt?(A[0]=Xt,A[1]=te,A[2]=Jt,A[3]=Ct,L.clearBufferuiv(L.COLOR,0,A)):(R[0]=Xt,R[1]=te,R[2]=Jt,R[3]=Ct,L.clearBufferiv(L.COLOR,0,R))}else ot|=L.COLOR_BUFFER_BIT}j&&(ot|=L.DEPTH_BUFFER_BIT),rt&&(ot|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(ot)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){i.removeEventListener("webglcontextlost",wt,!1),i.removeEventListener("webglcontextrestored",Gt,!1),i.removeEventListener("webglcontextcreationerror",yt,!1),Zt.dispose(),ft.dispose(),Vt.dispose(),Bt.dispose(),ke.dispose(),qe.dispose(),tt.dispose(),Ot.dispose(),ue.dispose(),dt.dispose(),bt.dispose(),bt.removeEventListener("sessionstart",pn),bt.removeEventListener("sessionend",Un),ta.stop()};function wt(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),H=!0}function Gt(){console.log("THREE.WebGLRenderer: Context Restored."),H=!1;const b=ne.autoReset,j=Wt.enabled,rt=Wt.autoUpdate,ot=Wt.needsUpdate,K=Wt.type;G(),ne.autoReset=b,Wt.enabled=j,Wt.autoUpdate=rt,Wt.needsUpdate=ot,Wt.type=K}function yt(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function mt(b){const j=b.target;j.removeEventListener("dispose",mt),qt(j)}function qt(b){le(b),Bt.remove(b)}function le(b){const j=Bt.get(b).programs;j!==void 0&&(j.forEach(function(rt){dt.releaseProgram(rt)}),b.isShaderMaterial&&dt.releaseShaderCache(b))}this.renderBufferDirect=function(b,j,rt,ot,K,Et){j===null&&(j=At);const Pt=K.isMesh&&K.matrixWorld.determinant()<0,It=Tl(b,j,rt,ot,K);Nt.setMaterial(ot,Pt);let Ct=rt.index,Xt=1;if(ot.wireframe===!0){if(Ct=T.getWireframeAttribute(rt),Ct===void 0)return;Xt=2}const te=rt.drawRange,Jt=rt.attributes.position;let ge=te.start*Xt,Oe=(te.start+te.count)*Xt;Et!==null&&(ge=Math.max(ge,Et.start*Xt),Oe=Math.min(Oe,(Et.start+Et.count)*Xt)),Ct!==null?(ge=Math.max(ge,0),Oe=Math.min(Oe,Ct.count)):Jt!=null&&(ge=Math.max(ge,0),Oe=Math.min(Oe,Jt.count));const Qe=Oe-ge;if(Qe<0||Qe===1/0)return;Ot.setup(K,ot,It,rt,Ct);let Ue,Ae=Lt;if(Ct!==null&&(Ue=U.get(Ct),Ae=ee,Ae.setIndex(Ue)),K.isMesh)ot.wireframe===!0?(Nt.setLineWidth(ot.wireframeLinewidth*Yt()),Ae.setMode(L.LINES)):Ae.setMode(L.TRIANGLES);else if(K.isLine){let $t=ot.linewidth;$t===void 0&&($t=1),Nt.setLineWidth($t*Yt()),K.isLineSegments?Ae.setMode(L.LINES):K.isLineLoop?Ae.setMode(L.LINE_LOOP):Ae.setMode(L.LINE_STRIP)}else K.isPoints?Ae.setMode(L.POINTS):K.isSprite&&Ae.setMode(L.TRIANGLES);if(K.isBatchedMesh)if(K._multiDrawInstances!==null)vl("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Ae.renderMultiDrawInstances(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount,K._multiDrawInstances);else if(ae.get("WEBGL_multi_draw"))Ae.renderMultiDraw(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount);else{const $t=K._multiDrawStarts,Ne=K._multiDrawCounts,me=K._multiDrawCount,mn=Ct?U.get(Ct).bytesPerElement:1,Qn=Bt.get(ot).currentProgram.getUniforms();for(let Re=0;Re<me;Re++)Qn.setValue(L,"_gl_DrawID",Re),Ae.render($t[Re]/mn,Ne[Re])}else if(K.isInstancedMesh)Ae.renderInstances(ge,Qe,K.count);else if(rt.isInstancedBufferGeometry){const $t=rt._maxInstanceCount!==void 0?rt._maxInstanceCount:1/0,Ne=Math.min(rt.instanceCount,$t);Ae.renderInstances(ge,Qe,Ne)}else Ae.render(ge,Qe)};function He(b,j,rt){b.transparent===!0&&b.side===Ma&&b.forceSinglePass===!1?(b.side=Kn,b.needsUpdate=!0,ci(b,j,rt),b.side=ls,b.needsUpdate=!0,ci(b,j,rt),b.side=Ma):ci(b,j,rt)}this.compile=function(b,j,rt=null){rt===null&&(rt=b),v=Vt.get(rt),v.init(j),P.push(v),rt.traverseVisible(function(K){K.isLight&&K.layers.test(j.layers)&&(v.pushLight(K),K.castShadow&&v.pushShadow(K))}),b!==rt&&b.traverseVisible(function(K){K.isLight&&K.layers.test(j.layers)&&(v.pushLight(K),K.castShadow&&v.pushShadow(K))}),v.setupLights();const ot=new Set;return b.traverse(function(K){if(!(K.isMesh||K.isPoints||K.isLine||K.isSprite))return;const Et=K.material;if(Et)if(Array.isArray(Et))for(let Pt=0;Pt<Et.length;Pt++){const It=Et[Pt];He(It,rt,K),ot.add(It)}else He(Et,rt,K),ot.add(Et)}),v=P.pop(),ot},this.compileAsync=function(b,j,rt=null){const ot=this.compile(b,j,rt);return new Promise(K=>{function Et(){if(ot.forEach(function(Pt){Bt.get(Pt).currentProgram.isReady()&&ot.delete(Pt)}),ot.size===0){K(b);return}setTimeout(Et,10)}ae.get("KHR_parallel_shader_compile")!==null?Et():setTimeout(Et,10)})};let xe=null;function $e(b){xe&&xe(b)}function pn(){ta.stop()}function Un(){ta.start()}const ta=new BS;ta.setAnimationLoop($e),typeof self<"u"&&ta.setContext(self),this.setAnimationLoop=function(b){xe=b,bt.setAnimationLoop(b),b===null?ta.stop():ta.start()},bt.addEventListener("sessionstart",pn),bt.addEventListener("sessionend",Un),this.render=function(b,j){if(j!==void 0&&j.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(H===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),j.parent===null&&j.matrixWorldAutoUpdate===!0&&j.updateMatrixWorld(),bt.enabled===!0&&bt.isPresenting===!0&&(bt.cameraAutoUpdate===!0&&bt.updateCamera(j),j=bt.getCamera()),b.isScene===!0&&b.onBeforeRender(D,b,j,k),v=Vt.get(b,P.length),v.init(j),P.push(v),it.multiplyMatrices(j.projectionMatrix,j.matrixWorldInverse),I.setFromProjectionMatrix(it,Ki,j.reversedDepth),J=this.localClippingEnabled,ct=Rt.init(this.clippingPlanes,J),x=ft.get(b,z.length),x.init(),z.push(x),bt.enabled===!0&&bt.isPresenting===!0){const Et=D.xr.getDepthSensingMesh();Et!==null&&fo(Et,j,-1/0,D.sortObjects)}fo(b,j,0,D.sortObjects),x.finish(),D.sortObjects===!0&&x.sort(gt,St),Mt=bt.enabled===!1||bt.isPresenting===!1||bt.hasDepthSensing()===!1,Mt&&Zt.addToRenderList(x,b),this.info.render.frame++,ct===!0&&Rt.beginShadows();const rt=v.state.shadowsArray;Wt.render(rt,b,j),ct===!0&&Rt.endShadows(),this.info.autoReset===!0&&this.info.reset();const ot=x.opaque,K=x.transmissive;if(v.setupLights(),j.isArrayCamera){const Et=j.cameras;if(K.length>0)for(let Pt=0,It=Et.length;Pt<It;Pt++){const Ct=Et[Pt];fs(ot,K,b,Ct)}Mt&&Zt.render(b);for(let Pt=0,It=Et.length;Pt<It;Pt++){const Ct=Et[Pt];El(x,b,Ct,Ct.viewport)}}else K.length>0&&fs(ot,K,b,j),Mt&&Zt.render(b),El(x,b,j);k!==null&&O===0&&(re.updateMultisampleRenderTarget(k),re.updateRenderTargetMipmap(k)),b.isScene===!0&&b.onAfterRender(D,b,j),Ot.resetDefaultState(),w=-1,C=null,P.pop(),P.length>0?(v=P[P.length-1],ct===!0&&Rt.setGlobalState(D.clippingPlanes,v.state.camera)):v=null,z.pop(),z.length>0?x=z[z.length-1]:x=null};function fo(b,j,rt,ot){if(b.visible===!1)return;if(b.layers.test(j.layers)){if(b.isGroup)rt=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(j);else if(b.isLight)v.pushLight(b),b.castShadow&&v.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||I.intersectsSprite(b)){ot&&Ut.setFromMatrixPosition(b.matrixWorld).applyMatrix4(it);const Pt=tt.update(b),It=b.material;It.visible&&x.push(b,Pt,It,rt,Ut.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||I.intersectsObject(b))){const Pt=tt.update(b),It=b.material;if(ot&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Ut.copy(b.boundingSphere.center)):(Pt.boundingSphere===null&&Pt.computeBoundingSphere(),Ut.copy(Pt.boundingSphere.center)),Ut.applyMatrix4(b.matrixWorld).applyMatrix4(it)),Array.isArray(It)){const Ct=Pt.groups;for(let Xt=0,te=Ct.length;Xt<te;Xt++){const Jt=Ct[Xt],ge=It[Jt.materialIndex];ge&&ge.visible&&x.push(b,Pt,ge,rt,Ut.z,Jt)}}else It.visible&&x.push(b,Pt,It,rt,Ut.z,null)}}const Et=b.children;for(let Pt=0,It=Et.length;Pt<It;Pt++)fo(Et[Pt],j,rt,ot)}function El(b,j,rt,ot){const K=b.opaque,Et=b.transmissive,Pt=b.transparent;v.setupLightsView(rt),ct===!0&&Rt.setGlobalState(D.clippingPlanes,rt),ot&&Nt.viewport(V.copy(ot)),K.length>0&&ea(K,j,rt),Et.length>0&&ea(Et,j,rt),Pt.length>0&&ea(Pt,j,rt),Nt.buffers.depth.setTest(!0),Nt.buffers.depth.setMask(!0),Nt.buffers.color.setMask(!0),Nt.setPolygonOffset(!1)}function fs(b,j,rt,ot){if((rt.isScene===!0?rt.overrideMaterial:null)!==null)return;v.state.transmissionRenderTarget[ot.id]===void 0&&(v.state.transmissionRenderTarget[ot.id]=new js(1,1,{generateMipmaps:!0,type:ae.has("EXT_color_buffer_half_float")||ae.has("EXT_color_buffer_float")?Sl:Ji,minFilter:Ys,samples:4,stencilBuffer:f,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:we.workingColorSpace}));const Et=v.state.transmissionRenderTarget[ot.id],Pt=ot.viewport||V;Et.setSize(Pt.z*D.transmissionResolutionScale,Pt.w*D.transmissionResolutionScale);const It=D.getRenderTarget(),Ct=D.getActiveCubeFace(),Xt=D.getActiveMipmapLevel();D.setRenderTarget(Et),D.getClearColor(_t),lt=D.getClearAlpha(),lt<1&&D.setClearColor(16777215,.5),D.clear(),Mt&&Zt.render(rt);const te=D.toneMapping;D.toneMapping=os;const Jt=ot.viewport;if(ot.viewport!==void 0&&(ot.viewport=void 0),v.setupLightsView(ot),ct===!0&&Rt.setGlobalState(D.clippingPlanes,ot),ea(b,rt,ot),re.updateMultisampleRenderTarget(Et),re.updateRenderTargetMipmap(Et),ae.has("WEBGL_multisampled_render_to_texture")===!1){let ge=!1;for(let Oe=0,Qe=j.length;Oe<Qe;Oe++){const Ue=j[Oe],Ae=Ue.object,$t=Ue.geometry,Ne=Ue.material,me=Ue.group;if(Ne.side===Ma&&Ae.layers.test(ot.layers)){const mn=Ne.side;Ne.side=Kn,Ne.needsUpdate=!0,hs(Ae,rt,ot,$t,Ne,me),Ne.side=mn,Ne.needsUpdate=!0,ge=!0}}ge===!0&&(re.updateMultisampleRenderTarget(Et),re.updateRenderTargetMipmap(Et))}D.setRenderTarget(It,Ct,Xt),D.setClearColor(_t,lt),Jt!==void 0&&(ot.viewport=Jt),D.toneMapping=te}function ea(b,j,rt){const ot=j.isScene===!0?j.overrideMaterial:null;for(let K=0,Et=b.length;K<Et;K++){const Pt=b[K],It=Pt.object,Ct=Pt.geometry,Xt=Pt.group;let te=Pt.material;te.allowOverride===!0&&ot!==null&&(te=ot),It.layers.test(rt.layers)&&hs(It,j,rt,Ct,te,Xt)}}function hs(b,j,rt,ot,K,Et){b.onBeforeRender(D,j,rt,ot,K,Et),b.modelViewMatrix.multiplyMatrices(rt.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),K.onBeforeRender(D,j,rt,ot,b,Et),K.transparent===!0&&K.side===Ma&&K.forceSinglePass===!1?(K.side=Kn,K.needsUpdate=!0,D.renderBufferDirect(rt,j,ot,K,b,Et),K.side=ls,K.needsUpdate=!0,D.renderBufferDirect(rt,j,ot,K,b,Et),K.side=Ma):D.renderBufferDirect(rt,j,ot,K,b,Et),b.onAfterRender(D,j,rt,ot,K,Et)}function ci(b,j,rt){j.isScene!==!0&&(j=At);const ot=Bt.get(b),K=v.state.lights,Et=v.state.shadowsArray,Pt=K.state.version,It=dt.getParameters(b,K.state,Et,j,rt),Ct=dt.getProgramCacheKey(It);let Xt=ot.programs;ot.environment=b.isMeshStandardMaterial?j.environment:null,ot.fog=j.fog,ot.envMap=(b.isMeshStandardMaterial?qe:ke).get(b.envMap||ot.environment),ot.envMapRotation=ot.environment!==null&&b.envMap===null?j.environmentRotation:b.envMapRotation,Xt===void 0&&(b.addEventListener("dispose",mt),Xt=new Map,ot.programs=Xt);let te=Xt.get(Ct);if(te!==void 0){if(ot.currentProgram===te&&ot.lightsStateVersion===Pt)return Ta(b,It),te}else It.uniforms=dt.getUniforms(b),b.onBeforeCompile(It,D),te=dt.acquireProgram(It,Ct),Xt.set(Ct,te),ot.uniforms=It.uniforms;const Jt=ot.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Jt.clippingPlanes=Rt.uniform),Ta(b,It),ot.needsLights=bl(b),ot.lightsStateVersion=Pt,ot.needsLights&&(Jt.ambientLightColor.value=K.state.ambient,Jt.lightProbe.value=K.state.probe,Jt.directionalLights.value=K.state.directional,Jt.directionalLightShadows.value=K.state.directionalShadow,Jt.spotLights.value=K.state.spot,Jt.spotLightShadows.value=K.state.spotShadow,Jt.rectAreaLights.value=K.state.rectArea,Jt.ltc_1.value=K.state.rectAreaLTC1,Jt.ltc_2.value=K.state.rectAreaLTC2,Jt.pointLights.value=K.state.point,Jt.pointLightShadows.value=K.state.pointShadow,Jt.hemisphereLights.value=K.state.hemi,Jt.directionalShadowMap.value=K.state.directionalShadowMap,Jt.directionalShadowMatrix.value=K.state.directionalShadowMatrix,Jt.spotShadowMap.value=K.state.spotShadowMap,Jt.spotLightMatrix.value=K.state.spotLightMatrix,Jt.spotLightMap.value=K.state.spotLightMap,Jt.pointShadowMap.value=K.state.pointShadowMap,Jt.pointShadowMatrix.value=K.state.pointShadowMatrix),ot.currentProgram=te,ot.uniformsList=null,te}function ds(b){if(b.uniformsList===null){const j=b.currentProgram.getUniforms();b.uniformsList=yc.seqWithValue(j.seq,b.uniforms)}return b.uniformsList}function Ta(b,j){const rt=Bt.get(b);rt.outputColorSpace=j.outputColorSpace,rt.batching=j.batching,rt.batchingColor=j.batchingColor,rt.instancing=j.instancing,rt.instancingColor=j.instancingColor,rt.instancingMorph=j.instancingMorph,rt.skinning=j.skinning,rt.morphTargets=j.morphTargets,rt.morphNormals=j.morphNormals,rt.morphColors=j.morphColors,rt.morphTargetsCount=j.morphTargetsCount,rt.numClippingPlanes=j.numClippingPlanes,rt.numIntersection=j.numClipIntersection,rt.vertexAlphas=j.vertexAlphas,rt.vertexTangents=j.vertexTangents,rt.toneMapping=j.toneMapping}function Tl(b,j,rt,ot,K){j.isScene!==!0&&(j=At),re.resetTextureUnits();const Et=j.fog,Pt=ot.isMeshStandardMaterial?j.environment:null,It=k===null?D.outputColorSpace:k.isXRRenderTarget===!0?k.texture.colorSpace:oo,Ct=(ot.isMeshStandardMaterial?qe:ke).get(ot.envMap||Pt),Xt=ot.vertexColors===!0&&!!rt.attributes.color&&rt.attributes.color.itemSize===4,te=!!rt.attributes.tangent&&(!!ot.normalMap||ot.anisotropy>0),Jt=!!rt.morphAttributes.position,ge=!!rt.morphAttributes.normal,Oe=!!rt.morphAttributes.color;let Qe=os;ot.toneMapped&&(k===null||k.isXRRenderTarget===!0)&&(Qe=D.toneMapping);const Ue=rt.morphAttributes.position||rt.morphAttributes.normal||rt.morphAttributes.color,Ae=Ue!==void 0?Ue.length:0,$t=Bt.get(ot),Ne=v.state.lights;if(ct===!0&&(J===!0||b!==C)){const en=b===C&&ot.id===w;Rt.setState(ot,b,en)}let me=!1;ot.version===$t.__version?($t.needsLights&&$t.lightsStateVersion!==Ne.state.version||$t.outputColorSpace!==It||K.isBatchedMesh&&$t.batching===!1||!K.isBatchedMesh&&$t.batching===!0||K.isBatchedMesh&&$t.batchingColor===!0&&K.colorTexture===null||K.isBatchedMesh&&$t.batchingColor===!1&&K.colorTexture!==null||K.isInstancedMesh&&$t.instancing===!1||!K.isInstancedMesh&&$t.instancing===!0||K.isSkinnedMesh&&$t.skinning===!1||!K.isSkinnedMesh&&$t.skinning===!0||K.isInstancedMesh&&$t.instancingColor===!0&&K.instanceColor===null||K.isInstancedMesh&&$t.instancingColor===!1&&K.instanceColor!==null||K.isInstancedMesh&&$t.instancingMorph===!0&&K.morphTexture===null||K.isInstancedMesh&&$t.instancingMorph===!1&&K.morphTexture!==null||$t.envMap!==Ct||ot.fog===!0&&$t.fog!==Et||$t.numClippingPlanes!==void 0&&($t.numClippingPlanes!==Rt.numPlanes||$t.numIntersection!==Rt.numIntersection)||$t.vertexAlphas!==Xt||$t.vertexTangents!==te||$t.morphTargets!==Jt||$t.morphNormals!==ge||$t.morphColors!==Oe||$t.toneMapping!==Qe||$t.morphTargetsCount!==Ae)&&(me=!0):(me=!0,$t.__version=ot.version);let mn=$t.currentProgram;me===!0&&(mn=ci(ot,j,K));let Qn=!1,Re=!1,ba=!1;const We=mn.getUniforms(),zn=$t.uniforms;if(Nt.useProgram(mn.program)&&(Qn=!0,Re=!0,ba=!0),ot.id!==w&&(w=ot.id,Re=!0),Qn||C!==b){Nt.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),We.setValue(L,"projectionMatrix",b.projectionMatrix),We.setValue(L,"viewMatrix",b.matrixWorldInverse);const Nn=We.map.cameraPosition;Nn!==void 0&&Nn.setValue(L,xt.setFromMatrixPosition(b.matrixWorld)),Kt.logarithmicDepthBuffer&&We.setValue(L,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(ot.isMeshPhongMaterial||ot.isMeshToonMaterial||ot.isMeshLambertMaterial||ot.isMeshBasicMaterial||ot.isMeshStandardMaterial||ot.isShaderMaterial)&&We.setValue(L,"isOrthographic",b.isOrthographicCamera===!0),C!==b&&(C=b,Re=!0,ba=!0)}if(K.isSkinnedMesh){We.setOptional(L,K,"bindMatrix"),We.setOptional(L,K,"bindMatrixInverse");const en=K.skeleton;en&&(en.boneTexture===null&&en.computeBoneTexture(),We.setValue(L,"boneTexture",en.boneTexture,re))}K.isBatchedMesh&&(We.setOptional(L,K,"batchingTexture"),We.setValue(L,"batchingTexture",K._matricesTexture,re),We.setOptional(L,K,"batchingIdTexture"),We.setValue(L,"batchingIdTexture",K._indirectTexture,re),We.setOptional(L,K,"batchingColorTexture"),K._colorsTexture!==null&&We.setValue(L,"batchingColorTexture",K._colorsTexture,re));const ln=rt.morphAttributes;if((ln.position!==void 0||ln.normal!==void 0||ln.color!==void 0)&&Tt.update(K,rt,mn),(Re||$t.receiveShadow!==K.receiveShadow)&&($t.receiveShadow=K.receiveShadow,We.setValue(L,"receiveShadow",K.receiveShadow)),ot.isMeshGouraudMaterial&&ot.envMap!==null&&(zn.envMap.value=Ct,zn.flipEnvMap.value=Ct.isCubeTexture&&Ct.isRenderTargetTexture===!1?-1:1),ot.isMeshStandardMaterial&&ot.envMap===null&&j.environment!==null&&(zn.envMapIntensity.value=j.environmentIntensity),Re&&(We.setValue(L,"toneMappingExposure",D.toneMappingExposure),$t.needsLights&&wc(zn,ba),Et&&ot.fog===!0&&vt.refreshFogUniforms(zn,Et),vt.refreshMaterialUniforms(zn,ot,Z,st,v.state.transmissionRenderTarget[b.id]),yc.upload(L,ds($t),zn,re)),ot.isShaderMaterial&&ot.uniformsNeedUpdate===!0&&(yc.upload(L,ds($t),zn,re),ot.uniformsNeedUpdate=!1),ot.isSpriteMaterial&&We.setValue(L,"center",K.center),We.setValue(L,"modelViewMatrix",K.modelViewMatrix),We.setValue(L,"normalMatrix",K.normalMatrix),We.setValue(L,"modelMatrix",K.matrixWorld),ot.isShaderMaterial||ot.isRawShaderMaterial){const en=ot.uniformsGroups;for(let Nn=0,Qs=en.length;Nn<Qs;Nn++){const Pi=en[Nn];ue.update(Pi,mn),ue.bind(Pi,mn)}}return mn}function wc(b,j){b.ambientLightColor.needsUpdate=j,b.lightProbe.needsUpdate=j,b.directionalLights.needsUpdate=j,b.directionalLightShadows.needsUpdate=j,b.pointLights.needsUpdate=j,b.pointLightShadows.needsUpdate=j,b.spotLights.needsUpdate=j,b.spotLightShadows.needsUpdate=j,b.rectAreaLights.needsUpdate=j,b.hemisphereLights.needsUpdate=j}function bl(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return B},this.getActiveMipmapLevel=function(){return O},this.getRenderTarget=function(){return k},this.setRenderTargetTextures=function(b,j,rt){const ot=Bt.get(b);ot.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,ot.__autoAllocateDepthBuffer===!1&&(ot.__useRenderToTexture=!1),Bt.get(b.texture).__webglTexture=j,Bt.get(b.depthTexture).__webglTexture=ot.__autoAllocateDepthBuffer?void 0:rt,ot.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,j){const rt=Bt.get(b);rt.__webglFramebuffer=j,rt.__useDefaultFramebuffer=j===void 0};const ho=L.createFramebuffer();this.setRenderTarget=function(b,j=0,rt=0){k=b,B=j,O=rt;let ot=!0,K=null,Et=!1,Pt=!1;if(b){const Ct=Bt.get(b);if(Ct.__useDefaultFramebuffer!==void 0)Nt.bindFramebuffer(L.FRAMEBUFFER,null),ot=!1;else if(Ct.__webglFramebuffer===void 0)re.setupRenderTarget(b);else if(Ct.__hasExternalTextures)re.rebindTextures(b,Bt.get(b.texture).__webglTexture,Bt.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const Jt=b.depthTexture;if(Ct.__boundDepthTexture!==Jt){if(Jt!==null&&Bt.has(Jt)&&(b.width!==Jt.image.width||b.height!==Jt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");re.setupDepthRenderbuffer(b)}}const Xt=b.texture;(Xt.isData3DTexture||Xt.isDataArrayTexture||Xt.isCompressedArrayTexture)&&(Pt=!0);const te=Bt.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(te[j])?K=te[j][rt]:K=te[j],Et=!0):b.samples>0&&re.useMultisampledRTT(b)===!1?K=Bt.get(b).__webglMultisampledFramebuffer:Array.isArray(te)?K=te[rt]:K=te,V.copy(b.viewport),at.copy(b.scissor),ut=b.scissorTest}else V.copy(Ht).multiplyScalar(Z).floor(),at.copy(se).multiplyScalar(Z).floor(),ut=Te;if(rt!==0&&(K=ho),Nt.bindFramebuffer(L.FRAMEBUFFER,K)&&ot&&Nt.drawBuffers(b,K),Nt.viewport(V),Nt.scissor(at),Nt.setScissorTest(ut),Et){const Ct=Bt.get(b.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ct.__webglTexture,rt)}else if(Pt){const Ct=j;for(let Xt=0;Xt<b.textures.length;Xt++){const te=Bt.get(b.textures[Xt]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Xt,te.__webglTexture,rt,Ct)}}else if(b!==null&&rt!==0){const Ct=Bt.get(b.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ct.__webglTexture,rt)}w=-1},this.readRenderTargetPixels=function(b,j,rt,ot,K,Et,Pt,It=0){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ct=Bt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Pt!==void 0&&(Ct=Ct[Pt]),Ct){Nt.bindFramebuffer(L.FRAMEBUFFER,Ct);try{const Xt=b.textures[It],te=Xt.format,Jt=Xt.type;if(!Kt.textureFormatReadable(te)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Kt.textureTypeReadable(Jt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}j>=0&&j<=b.width-ot&&rt>=0&&rt<=b.height-K&&(b.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+It),L.readPixels(j,rt,ot,K,jt.convert(te),jt.convert(Jt),Et))}finally{const Xt=k!==null?Bt.get(k).__webglFramebuffer:null;Nt.bindFramebuffer(L.FRAMEBUFFER,Xt)}}},this.readRenderTargetPixelsAsync=async function(b,j,rt,ot,K,Et,Pt,It=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ct=Bt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Pt!==void 0&&(Ct=Ct[Pt]),Ct)if(j>=0&&j<=b.width-ot&&rt>=0&&rt<=b.height-K){Nt.bindFramebuffer(L.FRAMEBUFFER,Ct);const Xt=b.textures[It],te=Xt.format,Jt=Xt.type;if(!Kt.textureFormatReadable(te))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Kt.textureTypeReadable(Jt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ge=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,ge),L.bufferData(L.PIXEL_PACK_BUFFER,Et.byteLength,L.STREAM_READ),b.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+It),L.readPixels(j,rt,ot,K,jt.convert(te),jt.convert(Jt),0);const Oe=k!==null?Bt.get(k).__webglFramebuffer:null;Nt.bindFramebuffer(L.FRAMEBUFFER,Oe);const Qe=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await FE(L,Qe,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,ge),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,Et),L.deleteBuffer(ge),L.deleteSync(Qe),Et}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,j=null,rt=0){const ot=Math.pow(2,-rt),K=Math.floor(b.image.width*ot),Et=Math.floor(b.image.height*ot),Pt=j!==null?j.x:0,It=j!==null?j.y:0;re.setTexture2D(b,0),L.copyTexSubImage2D(L.TEXTURE_2D,rt,0,0,Pt,It,K,Et),Nt.unbindTexture()};const ps=L.createFramebuffer(),Dc=L.createFramebuffer();this.copyTextureToTexture=function(b,j,rt=null,ot=null,K=0,Et=null){Et===null&&(K!==0?(vl("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Et=K,K=0):Et=0);let Pt,It,Ct,Xt,te,Jt,ge,Oe,Qe;const Ue=b.isCompressedTexture?b.mipmaps[Et]:b.image;if(rt!==null)Pt=rt.max.x-rt.min.x,It=rt.max.y-rt.min.y,Ct=rt.isBox3?rt.max.z-rt.min.z:1,Xt=rt.min.x,te=rt.min.y,Jt=rt.isBox3?rt.min.z:0;else{const ln=Math.pow(2,-K);Pt=Math.floor(Ue.width*ln),It=Math.floor(Ue.height*ln),b.isDataArrayTexture?Ct=Ue.depth:b.isData3DTexture?Ct=Math.floor(Ue.depth*ln):Ct=1,Xt=0,te=0,Jt=0}ot!==null?(ge=ot.x,Oe=ot.y,Qe=ot.z):(ge=0,Oe=0,Qe=0);const Ae=jt.convert(j.format),$t=jt.convert(j.type);let Ne;j.isData3DTexture?(re.setTexture3D(j,0),Ne=L.TEXTURE_3D):j.isDataArrayTexture||j.isCompressedArrayTexture?(re.setTexture2DArray(j,0),Ne=L.TEXTURE_2D_ARRAY):(re.setTexture2D(j,0),Ne=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,j.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,j.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,j.unpackAlignment);const me=L.getParameter(L.UNPACK_ROW_LENGTH),mn=L.getParameter(L.UNPACK_IMAGE_HEIGHT),Qn=L.getParameter(L.UNPACK_SKIP_PIXELS),Re=L.getParameter(L.UNPACK_SKIP_ROWS),ba=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,Ue.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Ue.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Xt),L.pixelStorei(L.UNPACK_SKIP_ROWS,te),L.pixelStorei(L.UNPACK_SKIP_IMAGES,Jt);const We=b.isDataArrayTexture||b.isData3DTexture,zn=j.isDataArrayTexture||j.isData3DTexture;if(b.isDepthTexture){const ln=Bt.get(b),en=Bt.get(j),Nn=Bt.get(ln.__renderTarget),Qs=Bt.get(en.__renderTarget);Nt.bindFramebuffer(L.READ_FRAMEBUFFER,Nn.__webglFramebuffer),Nt.bindFramebuffer(L.DRAW_FRAMEBUFFER,Qs.__webglFramebuffer);for(let Pi=0;Pi<Ct;Pi++)We&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Bt.get(b).__webglTexture,K,Jt+Pi),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Bt.get(j).__webglTexture,Et,Qe+Pi)),L.blitFramebuffer(Xt,te,Pt,It,ge,Oe,Pt,It,L.DEPTH_BUFFER_BIT,L.NEAREST);Nt.bindFramebuffer(L.READ_FRAMEBUFFER,null),Nt.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(K!==0||b.isRenderTargetTexture||Bt.has(b)){const ln=Bt.get(b),en=Bt.get(j);Nt.bindFramebuffer(L.READ_FRAMEBUFFER,ps),Nt.bindFramebuffer(L.DRAW_FRAMEBUFFER,Dc);for(let Nn=0;Nn<Ct;Nn++)We?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,ln.__webglTexture,K,Jt+Nn):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,ln.__webglTexture,K),zn?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,en.__webglTexture,Et,Qe+Nn):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,en.__webglTexture,Et),K!==0?L.blitFramebuffer(Xt,te,Pt,It,ge,Oe,Pt,It,L.COLOR_BUFFER_BIT,L.NEAREST):zn?L.copyTexSubImage3D(Ne,Et,ge,Oe,Qe+Nn,Xt,te,Pt,It):L.copyTexSubImage2D(Ne,Et,ge,Oe,Xt,te,Pt,It);Nt.bindFramebuffer(L.READ_FRAMEBUFFER,null),Nt.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else zn?b.isDataTexture||b.isData3DTexture?L.texSubImage3D(Ne,Et,ge,Oe,Qe,Pt,It,Ct,Ae,$t,Ue.data):j.isCompressedArrayTexture?L.compressedTexSubImage3D(Ne,Et,ge,Oe,Qe,Pt,It,Ct,Ae,Ue.data):L.texSubImage3D(Ne,Et,ge,Oe,Qe,Pt,It,Ct,Ae,$t,Ue):b.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,Et,ge,Oe,Pt,It,Ae,$t,Ue.data):b.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,Et,ge,Oe,Ue.width,Ue.height,Ae,Ue.data):L.texSubImage2D(L.TEXTURE_2D,Et,ge,Oe,Pt,It,Ae,$t,Ue);L.pixelStorei(L.UNPACK_ROW_LENGTH,me),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,mn),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Qn),L.pixelStorei(L.UNPACK_SKIP_ROWS,Re),L.pixelStorei(L.UNPACK_SKIP_IMAGES,ba),Et===0&&j.generateMipmaps&&L.generateMipmap(Ne),Nt.unbindTexture()},this.initRenderTarget=function(b){Bt.get(b).__webglFramebuffer===void 0&&re.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?re.setTextureCube(b,0):b.isData3DTexture?re.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?re.setTexture2DArray(b,0):re.setTexture2D(b,0),Nt.unbindTexture()},this.resetState=function(){B=0,O=0,k=null,Nt.reset(),Ot.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ki}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const i=this.getContext();i.drawingBufferColorSpace=we._getDrawingBufferColorSpace(e),i.unpackColorSpace=we._getUnpackColorSpace()}}const hS={type:"change"},qp={type:"start"},XS={type:"end"},mc=new Gp,dS=new as,cC=Math.cos(70*Rp.DEG2RAD),gn=new nt,Zn=2*Math.PI,Xe={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Bd=1e-6;class fC extends AT{constructor(e,i=null){super(e,i),this.state=Xe.NONE,this.target=new nt,this.cursor=new nt,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:eo.ROTATE,MIDDLE:eo.DOLLY,RIGHT:eo.PAN},this.touches={ONE:$r.ROTATE,TWO:$r.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new nt,this._lastQuaternion=new Ws,this._lastTargetPosition=new nt,this._quat=new Ws().setFromUnitVectors(e.up,new nt(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Hv,this._sphericalDelta=new Hv,this._scale=1,this._panOffset=new nt,this._rotateStart=new ce,this._rotateEnd=new ce,this._rotateDelta=new ce,this._panStart=new ce,this._panEnd=new ce,this._panDelta=new ce,this._dollyStart=new ce,this._dollyEnd=new ce,this._dollyDelta=new ce,this._dollyDirection=new nt,this._mouse=new ce,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=dC.bind(this),this._onPointerDown=hC.bind(this),this._onPointerUp=pC.bind(this),this._onContextMenu=xC.bind(this),this._onMouseWheel=gC.bind(this),this._onKeyDown=vC.bind(this),this._onTouchStart=SC.bind(this),this._onTouchMove=yC.bind(this),this._onMouseDown=mC.bind(this),this._onMouseMove=_C.bind(this),this._interceptControlDown=MC.bind(this),this._interceptControlUp=EC.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(hS),this.update(),this.state=Xe.NONE}update(e=null){const i=this.object.position;gn.copy(i).sub(this.target),gn.applyQuaternion(this._quat),this._spherical.setFromVector3(gn),this.autoRotate&&this.state===Xe.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let r=this.minAzimuthAngle,u=this.maxAzimuthAngle;isFinite(r)&&isFinite(u)&&(r<-Math.PI?r+=Zn:r>Math.PI&&(r-=Zn),u<-Math.PI?u+=Zn:u>Math.PI&&(u-=Zn),r<=u?this._spherical.theta=Math.max(r,Math.min(u,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(r+u)/2?Math.max(r,this._spherical.theta):Math.min(u,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let f=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const h=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),f=h!=this._spherical.radius}if(gn.setFromSpherical(this._spherical),gn.applyQuaternion(this._quatInverse),i.copy(this.target).add(gn),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let h=null;if(this.object.isPerspectiveCamera){const d=gn.length();h=this._clampDistance(d*this._scale);const g=d-h;this.object.position.addScaledVector(this._dollyDirection,g),this.object.updateMatrixWorld(),f=!!g}else if(this.object.isOrthographicCamera){const d=new nt(this._mouse.x,this._mouse.y,0);d.unproject(this.object);const g=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),f=g!==this.object.zoom;const _=new nt(this._mouse.x,this._mouse.y,0);_.unproject(this.object),this.object.position.sub(_).add(d),this.object.updateMatrixWorld(),h=gn.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;h!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(h).add(this.object.position):(mc.origin.copy(this.object.position),mc.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(mc.direction))<cC?this.object.lookAt(this.target):(dS.setFromNormalAndCoplanarPoint(this.object.up,this.target),mc.intersectPlane(dS,this.target))))}else if(this.object.isOrthographicCamera){const h=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),h!==this.object.zoom&&(this.object.updateProjectionMatrix(),f=!0)}return this._scale=1,this._performCursorZoom=!1,f||this._lastPosition.distanceToSquared(this.object.position)>Bd||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Bd||this._lastTargetPosition.distanceToSquared(this.target)>Bd?(this.dispatchEvent(hS),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Zn/60*this.autoRotateSpeed*e:Zn/60/60*this.autoRotateSpeed}_getZoomScale(e){const i=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*i)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,i){gn.setFromMatrixColumn(i,0),gn.multiplyScalar(-e),this._panOffset.add(gn)}_panUp(e,i){this.screenSpacePanning===!0?gn.setFromMatrixColumn(i,1):(gn.setFromMatrixColumn(i,0),gn.crossVectors(this.object.up,gn)),gn.multiplyScalar(e),this._panOffset.add(gn)}_pan(e,i){const r=this.domElement;if(this.object.isPerspectiveCamera){const u=this.object.position;gn.copy(u).sub(this.target);let f=gn.length();f*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*f/r.clientHeight,this.object.matrix),this._panUp(2*i*f/r.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/r.clientWidth,this.object.matrix),this._panUp(i*(this.object.top-this.object.bottom)/this.object.zoom/r.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,i){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const r=this.domElement.getBoundingClientRect(),u=e-r.left,f=i-r.top,h=r.width,d=r.height;this._mouse.x=u/h*2-1,this._mouse.y=-(f/d)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const i=this.domElement;this._rotateLeft(Zn*this._rotateDelta.x/i.clientHeight),this._rotateUp(Zn*this._rotateDelta.y/i.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let i=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Zn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),i=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Zn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),i=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Zn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),i=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Zn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),i=!0;break}i&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),r=.5*(e.pageX+i.x),u=.5*(e.pageY+i.y);this._rotateStart.set(r,u)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),r=.5*(e.pageX+i.x),u=.5*(e.pageY+i.y);this._panStart.set(r,u)}}_handleTouchStartDolly(e){const i=this._getSecondPointerPosition(e),r=e.pageX-i.x,u=e.pageY-i.y,f=Math.sqrt(r*r+u*u);this._dollyStart.set(0,f)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const r=this._getSecondPointerPosition(e),u=.5*(e.pageX+r.x),f=.5*(e.pageY+r.y);this._rotateEnd.set(u,f)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const i=this.domElement;this._rotateLeft(Zn*this._rotateDelta.x/i.clientHeight),this._rotateUp(Zn*this._rotateDelta.y/i.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),r=.5*(e.pageX+i.x),u=.5*(e.pageY+i.y);this._panEnd.set(r,u)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const i=this._getSecondPointerPosition(e),r=e.pageX-i.x,u=e.pageY-i.y,f=Math.sqrt(r*r+u*u);this._dollyEnd.set(0,f),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const h=(e.pageX+i.x)*.5,d=(e.pageY+i.y)*.5;this._updateZoomParameters(h,d)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let i=0;i<this._pointers.length;i++)if(this._pointers[i]==e.pointerId){this._pointers.splice(i,1);return}}_isTrackingPointer(e){for(let i=0;i<this._pointers.length;i++)if(this._pointers[i]==e.pointerId)return!0;return!1}_trackPointer(e){let i=this._pointerPositions[e.pointerId];i===void 0&&(i=new ce,this._pointerPositions[e.pointerId]=i),i.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const i=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[i]}_customWheelEvent(e){const i=e.deltaMode,r={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(i){case 1:r.deltaY*=16;break;case 2:r.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(r.deltaY*=10),r}}function hC(o){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(o.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(o)&&(this._addPointer(o),o.pointerType==="touch"?this._onTouchStart(o):this._onMouseDown(o)))}function dC(o){this.enabled!==!1&&(o.pointerType==="touch"?this._onTouchMove(o):this._onMouseMove(o))}function pC(o){switch(this._removePointer(o),this._pointers.length){case 0:this.domElement.releasePointerCapture(o.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(XS),this.state=Xe.NONE;break;case 1:const e=this._pointers[0],i=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:i.x,pageY:i.y});break}}function mC(o){let e;switch(o.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case eo.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(o),this.state=Xe.DOLLY;break;case eo.ROTATE:if(o.ctrlKey||o.metaKey||o.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(o),this.state=Xe.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(o),this.state=Xe.ROTATE}break;case eo.PAN:if(o.ctrlKey||o.metaKey||o.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(o),this.state=Xe.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(o),this.state=Xe.PAN}break;default:this.state=Xe.NONE}this.state!==Xe.NONE&&this.dispatchEvent(qp)}function _C(o){switch(this.state){case Xe.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(o);break;case Xe.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(o);break;case Xe.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(o);break}}function gC(o){this.enabled===!1||this.enableZoom===!1||this.state!==Xe.NONE||(o.preventDefault(),this.dispatchEvent(qp),this._handleMouseWheel(this._customWheelEvent(o)),this.dispatchEvent(XS))}function vC(o){this.enabled!==!1&&this._handleKeyDown(o)}function SC(o){switch(this._trackPointer(o),this._pointers.length){case 1:switch(this.touches.ONE){case $r.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(o),this.state=Xe.TOUCH_ROTATE;break;case $r.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(o),this.state=Xe.TOUCH_PAN;break;default:this.state=Xe.NONE}break;case 2:switch(this.touches.TWO){case $r.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(o),this.state=Xe.TOUCH_DOLLY_PAN;break;case $r.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(o),this.state=Xe.TOUCH_DOLLY_ROTATE;break;default:this.state=Xe.NONE}break;default:this.state=Xe.NONE}this.state!==Xe.NONE&&this.dispatchEvent(qp)}function yC(o){switch(this._trackPointer(o),this.state){case Xe.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(o),this.update();break;case Xe.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(o),this.update();break;case Xe.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(o),this.update();break;case Xe.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(o),this.update();break;default:this.state=Xe.NONE}}function xC(o){this.enabled!==!1&&o.preventDefault()}function MC(o){o.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function EC(o){o.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const Fd=[{id:"mulhouse",name:"42 Mulhouse",country:"France",coordinates:[7.329914,47.750077]},{id:"paris",name:"42 Paris",country:"France",coordinates:[2.3192,48.89704]},{id:"tokyo",name:"42 Tokyo",country:"Japan",coordinates:[139.68813187116757,35.69044841395869]},{id:"seoul",name:"42 Seoul",country:"South Korea",coordinates:[127.065101,37.488203]},{id:"singapore",name:"42 Singapore",country:"Singapore",coordinates:[103.808053,1.351616]},{id:"abu-dhabi",name:"42 Abu Dhabi",country:"United Arab Emirates",coordinates:[54.368035,24.520285]}];function TC(o,e,i=1){const r=Rp.degToRad(e),u=Rp.degToRad(o);return new nt(i*Math.cos(r)*Math.sin(u),i*Math.sin(r),i*Math.cos(r)*Math.cos(u))}function bC({onCampusSelect:o}){const e=xc.useRef(null);return xc.useEffect(()=>{const i=e.current;if(!i)return;const r=new cT,u=new xi(42,1,.1,100);u.position.set(0,0,3.2);const f=new uC({antialias:!0,alpha:!0}),h=window.matchMedia("(max-width: 700px)").matches;f.setPixelRatio(Math.min(window.devicePixelRatio||1,h?1.5:2)),f.outputColorSpace=li,i.appendChild(f.domElement);const d=new Mi(new bc(1,64,64),new gT({color:1059896,roughness:.82,metalness:.05}));r.add(d),r.add(new yT(14679295,462870,1.7));const g=new ET(16777215,1.8);g.position.set(3,2,4),r.add(g);const _=new bc(.025,12,12),S=new Xp({color:5698260}),m=new dT(_,S,Fd.length),y=new Ke;Fd.forEach((D,H)=>{const[B,O]=D.coordinates,k=TC(B,O,1.025);y.makeTranslation(k.x,k.y,k.z),m.setMatrixAt(H,y)}),m.instanceMatrix.needsUpdate=!0,r.add(m);const M=new fC(u,f.domElement);M.enablePan=!1,M.enableZoom=!0,M.enableDamping=!1,M.minDistance=2.1,M.maxDistance=4.4;function A(){f.render(r,u)}function R(){const D=Math.max(1,i.clientWidth),H=Math.max(1,i.clientHeight);u.aspect=D/H,u.updateProjectionMatrix(),f.setSize(D,H,!1),A()}const x=new bT,v=new ce;function z(D){const H=f.domElement.getBoundingClientRect();v.x=(D.clientX-H.left)/H.width*2-1,v.y=-((D.clientY-H.top)/H.height)*2+1,x.setFromCamera(v,u);const B=x.intersectObject(m)[0];B?.instanceId!==void 0&&o?.(Fd[B.instanceId])}const P=new ResizeObserver(R);return P.observe(i),M.addEventListener("change",A),f.domElement.addEventListener("click",z),R(),()=>{P.disconnect(),M.removeEventListener("change",A),f.domElement.removeEventListener("click",z),M.dispose(),_.dispose(),S.dispose(),d.geometry.dispose(),d.material.dispose(),f.dispose(),f.domElement.remove()}},[o]),on.jsx("div",{ref:e,className:"globe-host"})}function AC(){const[o,e]=xc.useState(null);return on.jsxs("main",{className:"app-shell",children:[on.jsxs("header",{className:"hero",children:[on.jsx("p",{className:"eyebrow",children:"42 HORIZON / TECHNICAL SPIKE"}),on.jsx("h1",{children:"Explore the 42 Network"}),on.jsx("p",{children:"Phase 1 only: a clean Three.js globe with a few real campus positions."})]}),on.jsxs("section",{className:"globe-panel","aria-label":"42 Network globe",children:[on.jsx(bC,{onCampusSelect:e}),on.jsx("aside",{className:"campus-card","aria-live":"polite",children:o?on.jsxs(on.Fragment,{children:[on.jsx("span",{children:"Selected campus"}),on.jsx("strong",{children:o.name}),on.jsx("small",{children:o.country})]}):on.jsxs(on.Fragment,{children:[on.jsx("span",{children:"Explorer"}),on.jsx("strong",{children:"Rotate the globe"}),on.jsx("small",{children:"Click a campus point to select it."})]})})]})]})}OM.createRoot(document.getElementById("root")).render(on.jsx(xc.StrictMode,{children:on.jsx(AC,{})}));
