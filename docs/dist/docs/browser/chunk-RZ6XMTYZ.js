import{K as o2,N as t2,O as z2,R as m2,W as v1,X as c1,Y as b,a as c2,b as a2,ca as M2,d as d1,e as l2,g as E,l as e2,o as r2,q as i2,t as L1,u as s2,v as f2,x as n2}from"./chunk-SPTROXX7.js";function y1(c,l){(l==null||l>c.length)&&(l=c.length);for(var a=0,e=Array(l);a<l;a++)e[a]=c[a];return e}function a4(c){if(Array.isArray(c))return c}function l4(c){if(Array.isArray(c))return y1(c)}function e4(c,l){if(!(c instanceof l))throw new TypeError("Cannot call a class as a function")}function p2(c,l){for(var a=0;a<l.length;a++){var e=l[a];e.enumerable=e.enumerable||!1,e.configurable=!0,"value"in e&&(e.writable=!0),Object.defineProperty(c,_2(e.key),e)}}function r4(c,l,a){return l&&p2(c.prototype,l),a&&p2(c,a),Object.defineProperty(c,"prototype",{writable:!1}),c}function e1(c,l){var a=typeof Symbol<"u"&&c[Symbol.iterator]||c["@@iterator"];if(!a){if(Array.isArray(c)||(a=W1(c))||l&&c&&typeof c.length=="number"){a&&(c=a);var e=0,r=function(){};return{s:r,n:function(){return e>=c.length?{done:!0}:{done:!1,value:c[e++]}},e:function(n){throw n},f:r}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var i,s=!0,f=!1;return{s:function(){a=a.call(c)},n:function(){var n=a.next();return s=n.done,n},e:function(n){f=!0,i=n},f:function(){try{s||a.return==null||a.return()}finally{if(f)throw i}}}}function p(c,l,a){return(l=_2(l))in c?Object.defineProperty(c,l,{value:a,enumerable:!0,configurable:!0,writable:!0}):c[l]=a,c}function i4(c){if(typeof Symbol<"u"&&c[Symbol.iterator]!=null||c["@@iterator"]!=null)return Array.from(c)}function s4(c,l){var a=c==null?null:typeof Symbol<"u"&&c[Symbol.iterator]||c["@@iterator"];if(a!=null){var e,r,i,s,f=[],n=!0,t=!1;try{if(i=(a=a.call(c)).next,l===0){if(Object(a)!==a)return;n=!1}else for(;!(n=(e=i.call(a)).done)&&(f.push(e.value),f.length!==l);n=!0);}catch(m){t=!0,r=m}finally{try{if(!n&&a.return!=null&&(s=a.return(),Object(s)!==s))return}finally{if(t)throw r}}return f}}function f4(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function n4(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function u2(c,l){var a=Object.keys(c);if(Object.getOwnPropertySymbols){var e=Object.getOwnPropertySymbols(c);l&&(e=e.filter(function(r){return Object.getOwnPropertyDescriptor(c,r).enumerable})),a.push.apply(a,e)}return a}function o(c){for(var l=1;l<arguments.length;l++){var a=arguments[l]!=null?arguments[l]:{};l%2?u2(Object(a),!0).forEach(function(e){p(c,e,a[e])}):Object.getOwnPropertyDescriptors?Object.defineProperties(c,Object.getOwnPropertyDescriptors(a)):u2(Object(a)).forEach(function(e){Object.defineProperty(c,e,Object.getOwnPropertyDescriptor(a,e))})}return c}function o1(c,l){return a4(c)||s4(c,l)||W1(c,l)||f4()}function w(c){return l4(c)||i4(c)||W1(c)||n4()}function o4(c,l){if(typeof c!="object"||!c)return c;var a=c[Symbol.toPrimitive];if(a!==void 0){var e=a.call(c,l||"default");if(typeof e!="object")return e;throw new TypeError("@@toPrimitive must return a primitive value.")}return(l==="string"?String:Number)(c)}function _2(c){var l=o4(c,"string");return typeof l=="symbol"?l:l+""}function s1(c){"@babel/helpers - typeof";return s1=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(l){return typeof l}:function(l){return l&&typeof Symbol=="function"&&l.constructor===Symbol&&l!==Symbol.prototype?"symbol":typeof l},s1(c)}function W1(c,l){if(c){if(typeof c=="string")return y1(c,l);var a={}.toString.call(c).slice(8,-1);return a==="Object"&&c.constructor&&(a=c.constructor.name),a==="Map"||a==="Set"?Array.from(c):a==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a)?y1(c,l):void 0}}var d2=function(){},G1={},$2={},X2=null,Y2={mark:d2,measure:d2};try{typeof window<"u"&&(G1=window),typeof document<"u"&&($2=document),typeof MutationObserver<"u"&&(X2=MutationObserver),typeof performance<"u"&&(Y2=performance)}catch{}var t4=G1.navigator||{},L2=t4.userAgent,v2=L2===void 0?"":L2,R=G1,L=$2,C2=X2,a1=Y2,P5=!!R.document,D=!!L.documentElement&&!!L.head&&typeof L.addEventListener=="function"&&typeof L.createElement=="function",K2=~v2.indexOf("MSIE")||~v2.indexOf("Trident/"),C1,z4=/fa(k|kd|s|r|l|t|d|dr|dl|dt|b|slr|slpr|wsb|tl|ns|nds|es|jr|jfr|jdr|usb|ufsb|udsb|cr|ss|sr|sl|st|sds|sdr|sdl|sdt)?[\-\ ]/,m4=/Font ?Awesome ?([567 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit|Notdog Duo|Notdog|Chisel|Etch|Thumbprint|Jelly Fill|Jelly Duo|Jelly|Utility|Utility Fill|Utility Duo|Slab Press|Slab|Whiteboard)?.*/i,J2={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fab:"brands","fa-brands":"brands"},duotone:{fa:"solid",fad:"solid","fa-solid":"solid","fa-duotone":"solid",fadr:"regular","fa-regular":"regular",fadl:"light","fa-light":"light",fadt:"thin","fa-thin":"thin"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid",fasdr:"regular","fa-regular":"regular",fasdl:"light","fa-light":"light",fasdt:"thin","fa-thin":"thin"},slab:{"fa-regular":"regular",faslr:"regular"},"slab-press":{"fa-regular":"regular",faslpr:"regular"},thumbprint:{"fa-light":"light",fatl:"light"},whiteboard:{"fa-semibold":"semibold",fawsb:"semibold"},notdog:{"fa-solid":"solid",fans:"solid"},"notdog-duo":{"fa-solid":"solid",fands:"solid"},etch:{"fa-solid":"solid",faes:"solid"},jelly:{"fa-regular":"regular",fajr:"regular"},"jelly-fill":{"fa-regular":"regular",fajfr:"regular"},"jelly-duo":{"fa-regular":"regular",fajdr:"regular"},chisel:{"fa-regular":"regular",facr:"regular"},utility:{"fa-semibold":"semibold",fausb:"semibold"},"utility-duo":{"fa-semibold":"semibold",faudsb:"semibold"},"utility-fill":{"fa-semibold":"semibold",faufsb:"semibold"}},M4={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},Q2=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-utility","fa-utility-duo","fa-utility-fill"],g="classic",J="duotone",Z2="sharp",c3="sharp-duotone",a3="chisel",l3="etch",e3="jelly",r3="jelly-duo",i3="jelly-fill",s3="notdog",f3="notdog-duo",n3="slab",o3="slab-press",t3="thumbprint",z3="utility",m3="utility-duo",M3="utility-fill",p3="whiteboard",p4="Classic",u4="Duotone",d4="Sharp",L4="Sharp Duotone",v4="Chisel",C4="Etch",h4="Jelly",g4="Jelly Duo",x4="Jelly Fill",b4="Notdog",N4="Notdog Duo",S4="Slab",y4="Slab Press",k4="Thumbprint",w4="Utility",A4="Utility Duo",P4="Utility Fill",F4="Whiteboard",u3=[g,J,Z2,c3,a3,l3,e3,r3,i3,s3,f3,n3,o3,t3,z3,m3,M3,p3],F5=(C1={},p(p(p(p(p(p(p(p(p(p(C1,g,p4),J,u4),Z2,d4),c3,L4),a3,v4),l3,C4),e3,h4),r3,g4),i3,x4),s3,b4),p(p(p(p(p(p(p(p(C1,f3,N4),n3,S4),o3,y4),t3,k4),z3,w4),m3,A4),M3,P4),p3,F4)),T4={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},duotone:{900:"fad",400:"fadr",300:"fadl",100:"fadt"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds",400:"fasdr",300:"fasdl",100:"fasdt"},slab:{400:"faslr"},"slab-press":{400:"faslpr"},whiteboard:{600:"fawsb"},thumbprint:{300:"fatl"},notdog:{900:"fans"},"notdog-duo":{900:"fands"},etch:{900:"faes"},chisel:{400:"facr"},jelly:{400:"fajr"},"jelly-fill":{400:"fajfr"},"jelly-duo":{400:"fajdr"},utility:{600:"fausb"},"utility-duo":{600:"faudsb"},"utility-fill":{600:"faufsb"}},D4={"Font Awesome 7 Free":{900:"fas",400:"far"},"Font Awesome 7 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 7 Brands":{400:"fab",normal:"fab"},"Font Awesome 7 Duotone":{900:"fad",400:"fadr",normal:"fadr",300:"fadl",100:"fadt"},"Font Awesome 7 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 7 Sharp Duotone":{900:"fasds",400:"fasdr",normal:"fasdr",300:"fasdl",100:"fasdt"},"Font Awesome 7 Jelly":{400:"fajr",normal:"fajr"},"Font Awesome 7 Jelly Fill":{400:"fajfr",normal:"fajfr"},"Font Awesome 7 Jelly Duo":{400:"fajdr",normal:"fajdr"},"Font Awesome 7 Slab":{400:"faslr",normal:"faslr"},"Font Awesome 7 Slab Press":{400:"faslpr",normal:"faslpr"},"Font Awesome 7 Thumbprint":{300:"fatl",normal:"fatl"},"Font Awesome 7 Notdog":{900:"fans",normal:"fans"},"Font Awesome 7 Notdog Duo":{900:"fands",normal:"fands"},"Font Awesome 7 Etch":{900:"faes",normal:"faes"},"Font Awesome 7 Chisel":{400:"facr",normal:"facr"},"Font Awesome 7 Whiteboard":{600:"fawsb",normal:"fawsb"},"Font Awesome 7 Utility":{600:"fausb",normal:"fausb"},"Font Awesome 7 Utility Duo":{600:"faudsb",normal:"faudsb"},"Font Awesome 7 Utility Fill":{600:"faufsb",normal:"faufsb"}},B4=new Map([["classic",{defaultShortPrefixId:"fas",defaultStyleId:"solid",styleIds:["solid","regular","light","thin","brands"],futureStyleIds:[],defaultFontWeight:900}],["duotone",{defaultShortPrefixId:"fad",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp",{defaultShortPrefixId:"fass",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp-duotone",{defaultShortPrefixId:"fasds",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["chisel",{defaultShortPrefixId:"facr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["etch",{defaultShortPrefixId:"faes",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["jelly",{defaultShortPrefixId:"fajr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-duo",{defaultShortPrefixId:"fajdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-fill",{defaultShortPrefixId:"fajfr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["notdog",{defaultShortPrefixId:"fans",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog-duo",{defaultShortPrefixId:"fands",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["slab",{defaultShortPrefixId:"faslr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press",{defaultShortPrefixId:"faslpr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["thumbprint",{defaultShortPrefixId:"fatl",defaultStyleId:"light",styleIds:["light"],futureStyleIds:[],defaultFontWeight:300}],["utility",{defaultShortPrefixId:"fausb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-duo",{defaultShortPrefixId:"faudsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-fill",{defaultShortPrefixId:"faufsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["whiteboard",{defaultShortPrefixId:"fawsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}]]),R4={chisel:{regular:"facr"},classic:{brands:"fab",light:"fal",regular:"far",solid:"fas",thin:"fat"},duotone:{light:"fadl",regular:"fadr",solid:"fad",thin:"fadt"},etch:{solid:"faes"},jelly:{regular:"fajr"},"jelly-duo":{regular:"fajdr"},"jelly-fill":{regular:"fajfr"},notdog:{solid:"fans"},"notdog-duo":{solid:"fands"},sharp:{light:"fasl",regular:"fasr",solid:"fass",thin:"fast"},"sharp-duotone":{light:"fasdl",regular:"fasdr",solid:"fasds",thin:"fasdt"},slab:{regular:"faslr"},"slab-press":{regular:"faslpr"},thumbprint:{light:"fatl"},utility:{semibold:"fausb"},"utility-duo":{semibold:"faudsb"},"utility-fill":{semibold:"faufsb"},whiteboard:{semibold:"fawsb"}},d3=["fak","fa-kit","fakd","fa-kit-duotone"],h2={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},H4=["kit"],q4="kit",E4="kit-duotone",U4="Kit",I4="Kit Duotone",T5=p(p({},q4,U4),E4,I4),W4={kit:{"fa-kit":"fak"},"kit-duotone":{"fa-kit-duotone":"fakd"}},G4={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},O4={kit:{fak:"fa-kit"},"kit-duotone":{fakd:"fa-kit-duotone"}},g2={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}},h1,l1={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},j4=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-utility","fa-utility-duo","fa-utility-fill"],V4="classic",_4="duotone",$4="sharp",X4="sharp-duotone",Y4="chisel",K4="etch",J4="jelly",Q4="jelly-duo",Z4="jelly-fill",c0="notdog",a0="notdog-duo",l0="slab",e0="slab-press",r0="thumbprint",i0="utility",s0="utility-duo",f0="utility-fill",n0="whiteboard",o0="Classic",t0="Duotone",z0="Sharp",m0="Sharp Duotone",M0="Chisel",p0="Etch",u0="Jelly",d0="Jelly Duo",L0="Jelly Fill",v0="Notdog",C0="Notdog Duo",h0="Slab",g0="Slab Press",x0="Thumbprint",b0="Utility",N0="Utility Duo",S0="Utility Fill",y0="Whiteboard",D5=(h1={},p(p(p(p(p(p(p(p(p(p(h1,V4,o0),_4,t0),$4,z0),X4,m0),Y4,M0),K4,p0),J4,u0),Q4,d0),Z4,L0),c0,v0),p(p(p(p(p(p(p(p(h1,a0,C0),l0,h0),e0,g0),r0,x0),i0,b0),s0,N0),f0,S0),n0,y0)),k0="kit",w0="kit-duotone",A0="Kit",P0="Kit Duotone",B5=p(p({},k0,A0),w0,P0),F0={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},duotone:{"fa-regular":"fadr","fa-light":"fadl","fa-thin":"fadt"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds","fa-regular":"fasdr","fa-light":"fasdl","fa-thin":"fasdt"},slab:{"fa-regular":"faslr"},"slab-press":{"fa-regular":"faslpr"},whiteboard:{"fa-semibold":"fawsb"},thumbprint:{"fa-light":"fatl"},notdog:{"fa-solid":"fans"},"notdog-duo":{"fa-solid":"fands"},etch:{"fa-solid":"faes"},jelly:{"fa-regular":"fajr"},"jelly-fill":{"fa-regular":"fajfr"},"jelly-duo":{"fa-regular":"fajdr"},chisel:{"fa-regular":"facr"},utility:{"fa-semibold":"fausb"},"utility-duo":{"fa-semibold":"faudsb"},"utility-fill":{"fa-semibold":"faufsb"}},T0={classic:["fas","far","fal","fat","fad"],duotone:["fadr","fadl","fadt"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds","fasdr","fasdl","fasdt"],slab:["faslr"],"slab-press":["faslpr"],whiteboard:["fawsb"],thumbprint:["fatl"],notdog:["fans"],"notdog-duo":["fands"],etch:["faes"],jelly:["fajr"],"jelly-fill":["fajfr"],"jelly-duo":["fajdr"],chisel:["facr"],utility:["fausb"],"utility-duo":["faudsb"],"utility-fill":["faufsb"]},k1={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},duotone:{fadr:"fa-regular",fadl:"fa-light",fadt:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid",fasdr:"fa-regular",fasdl:"fa-light",fasdt:"fa-thin"},slab:{faslr:"fa-regular"},"slab-press":{faslpr:"fa-regular"},whiteboard:{fawsb:"fa-semibold"},thumbprint:{fatl:"fa-light"},notdog:{fans:"fa-solid"},"notdog-duo":{fands:"fa-solid"},etch:{faes:"fa-solid"},jelly:{fajr:"fa-regular"},"jelly-fill":{fajfr:"fa-regular"},"jelly-duo":{fajdr:"fa-regular"},chisel:{facr:"fa-regular"},utility:{fausb:"fa-semibold"},"utility-duo":{faudsb:"fa-semibold"},"utility-fill":{faufsb:"fa-semibold"}},D0=["fa-solid","fa-regular","fa-light","fa-thin","fa-duotone","fa-brands","fa-semibold"],L3=["fa","fas","far","fal","fat","fad","fadr","fadl","fadt","fab","fass","fasr","fasl","fast","fasds","fasdr","fasdl","fasdt","faslr","faslpr","fawsb","fatl","fans","fands","faes","fajr","fajfr","fajdr","facr","fausb","faudsb","faufsb"].concat(j4,D0),B0=["solid","regular","light","thin","duotone","brands","semibold"],v3=[1,2,3,4,5,6,7,8,9,10],R0=v3.concat([11,12,13,14,15,16,17,18,19,20]),H0=["aw","fw","pull-left","pull-right"],q0=[].concat(w(Object.keys(T0)),B0,H0,["2xs","xs","sm","lg","xl","2xl","beat","border","fade","beat-fade","bounce","flip-both","flip-horizontal","flip-vertical","flip","inverse","layers","layers-bottom-left","layers-bottom-right","layers-counter","layers-text","layers-top-left","layers-top-right","li","pull-end","pull-start","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","stack-1x","stack-2x","stack","ul","width-auto","width-fixed",l1.GROUP,l1.SWAP_OPACITY,l1.PRIMARY,l1.SECONDARY]).concat(v3.map(function(c){return"".concat(c,"x")})).concat(R0.map(function(c){return"w-".concat(c)})),E0={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}},F="___FONT_AWESOME___",w1=16,C3="fa",h3="svg-inline--fa",I="data-fa-i2svg",A1="data-fa-pseudo-element",U0="data-fa-pseudo-element-pending",O1="data-prefix",j1="data-icon",x2="fontawesome-i2svg",I0="async",W0=["HTML","HEAD","STYLE","SCRIPT"],g3=["::before","::after",":before",":after"],x3=(function(){try{return!0}catch{return!1}})();function Q(c){return new Proxy(c,{get:function(a,e){return e in a?a[e]:a[g]}})}var b3=o({},J2);b3[g]=o(o(o(o({},{"fa-duotone":"duotone"}),J2[g]),h2.kit),h2["kit-duotone"]);var G0=Q(b3),P1=o({},R4);P1[g]=o(o(o(o({},{duotone:"fad"}),P1[g]),g2.kit),g2["kit-duotone"]);var b2=Q(P1),F1=o({},k1);F1[g]=o(o({},F1[g]),O4.kit);var V1=Q(F1),T1=o({},F0);T1[g]=o(o({},T1[g]),W4.kit);var R5=Q(T1),O0=z4,N3="fa-layers-text",j0=m4,V0=o({},T4),H5=Q(V0),_0=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],g1=M4,$0=[].concat(w(H4),w(q0)),X=R.FontAwesomeConfig||{};function X0(c){var l=L.querySelector("script["+c+"]");if(l)return l.getAttribute(c)}function Y0(c){return c===""?!0:c==="false"?!1:c==="true"?!0:c}L&&typeof L.querySelector=="function"&&(N2=[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-search-pseudo-elements","searchPseudoElements"],["data-search-pseudo-elements-warnings","searchPseudoElementsWarnings"],["data-search-pseudo-elements-full-scan","searchPseudoElementsFullScan"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]],N2.forEach(function(c){var l=o1(c,2),a=l[0],e=l[1],r=Y0(X0(a));r!=null&&(X[e]=r)}));var N2,S3={styleDefault:"solid",familyDefault:g,cssPrefix:C3,replacementClass:h3,autoReplaceSvg:!0,autoAddCss:!0,searchPseudoElements:!1,searchPseudoElementsWarnings:!0,searchPseudoElementsFullScan:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};X.familyPrefix&&(X.cssPrefix=X.familyPrefix);var V=o(o({},S3),X);V.autoReplaceSvg||(V.observeMutations=!1);var M={};Object.keys(S3).forEach(function(c){Object.defineProperty(M,c,{enumerable:!0,set:function(a){V[c]=a,Y.forEach(function(e){return e(M)})},get:function(){return V[c]}})});Object.defineProperty(M,"familyPrefix",{enumerable:!0,set:function(l){V.cssPrefix=l,Y.forEach(function(a){return a(M)})},get:function(){return V.cssPrefix}});R.FontAwesomeConfig=M;var Y=[];function K0(c){return Y.push(c),function(){Y.splice(Y.indexOf(c),1)}}var B=w1,A={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function J0(c){if(!(!c||!D)){var l=L.createElement("style");l.setAttribute("type","text/css"),l.innerHTML=c;for(var a=L.head.childNodes,e=null,r=a.length-1;r>-1;r--){var i=a[r],s=(i.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(s)>-1&&(e=i)}return L.head.insertBefore(l,e),c}}var Q0="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function S2(){for(var c=12,l="";c-- >0;)l+=Q0[Math.random()*62|0];return l}function _(c){for(var l=[],a=(c||[]).length>>>0;a--;)l[a]=c[a];return l}function _1(c){return c.classList?_(c.classList):(c.getAttribute("class")||"").split(" ").filter(function(l){return l})}function y3(c){return"".concat(c).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Z0(c){return Object.keys(c||{}).reduce(function(l,a){return l+"".concat(a,'="').concat(y3(c[a]),'" ')},"").trim()}function t1(c){return Object.keys(c||{}).reduce(function(l,a){return l+"".concat(a,": ").concat(c[a].trim(),";")},"")}function $1(c){return c.size!==A.size||c.x!==A.x||c.y!==A.y||c.rotate!==A.rotate||c.flipX||c.flipY}function c6(c){var l=c.transform,a=c.containerWidth,e=c.iconWidth,r={transform:"translate(".concat(a/2," 256)")},i="translate(".concat(l.x*32,", ").concat(l.y*32,") "),s="scale(".concat(l.size/16*(l.flipX?-1:1),", ").concat(l.size/16*(l.flipY?-1:1),") "),f="rotate(".concat(l.rotate," 0 0)"),n={transform:"".concat(i," ").concat(s," ").concat(f)},t={transform:"translate(".concat(e/2*-1," -256)")};return{outer:r,inner:n,path:t}}function a6(c){var l=c.transform,a=c.width,e=a===void 0?w1:a,r=c.height,i=r===void 0?w1:r,s=c.startCentered,f=s===void 0?!1:s,n="";return f&&K2?n+="translate(".concat(l.x/B-e/2,"em, ").concat(l.y/B-i/2,"em) "):f?n+="translate(calc(-50% + ".concat(l.x/B,"em), calc(-50% + ").concat(l.y/B,"em)) "):n+="translate(".concat(l.x/B,"em, ").concat(l.y/B,"em) "),n+="scale(".concat(l.size/B*(l.flipX?-1:1),", ").concat(l.size/B*(l.flipY?-1:1),") "),n+="rotate(".concat(l.rotate,"deg) "),n}var l6=`:root, :host {
  --fa-font-solid: normal 900 1em/1 "Font Awesome 7 Free";
  --fa-font-regular: normal 400 1em/1 "Font Awesome 7 Free";
  --fa-font-light: normal 300 1em/1 "Font Awesome 7 Pro";
  --fa-font-thin: normal 100 1em/1 "Font Awesome 7 Pro";
  --fa-font-duotone: normal 900 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-regular: normal 400 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-light: normal 300 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-thin: normal 100 1em/1 "Font Awesome 7 Duotone";
  --fa-font-brands: normal 400 1em/1 "Font Awesome 7 Brands";
  --fa-font-sharp-solid: normal 900 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-regular: normal 400 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-light: normal 300 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-thin: normal 100 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-duotone-solid: normal 900 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-regular: normal 400 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-light: normal 300 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-thin: normal 100 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-slab-regular: normal 400 1em/1 "Font Awesome 7 Slab";
  --fa-font-slab-press-regular: normal 400 1em/1 "Font Awesome 7 Slab Press";
  --fa-font-whiteboard-semibold: normal 600 1em/1 "Font Awesome 7 Whiteboard";
  --fa-font-thumbprint-light: normal 300 1em/1 "Font Awesome 7 Thumbprint";
  --fa-font-notdog-solid: normal 900 1em/1 "Font Awesome 7 Notdog";
  --fa-font-notdog-duo-solid: normal 900 1em/1 "Font Awesome 7 Notdog Duo";
  --fa-font-etch-solid: normal 900 1em/1 "Font Awesome 7 Etch";
  --fa-font-jelly-regular: normal 400 1em/1 "Font Awesome 7 Jelly";
  --fa-font-jelly-fill-regular: normal 400 1em/1 "Font Awesome 7 Jelly Fill";
  --fa-font-jelly-duo-regular: normal 400 1em/1 "Font Awesome 7 Jelly Duo";
  --fa-font-chisel-regular: normal 400 1em/1 "Font Awesome 7 Chisel";
  --fa-font-utility-semibold: normal 600 1em/1 "Font Awesome 7 Utility";
  --fa-font-utility-duo-semibold: normal 600 1em/1 "Font Awesome 7 Utility Duo";
  --fa-font-utility-fill-semibold: normal 600 1em/1 "Font Awesome 7 Utility Fill";
}

.svg-inline--fa {
  box-sizing: content-box;
  display: var(--fa-display, inline-block);
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.svg-inline--fa.fa-2xs {
  vertical-align: 0.1em;
}
.svg-inline--fa.fa-xs {
  vertical-align: 0em;
}
.svg-inline--fa.fa-sm {
  vertical-align: -0.0714285714em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.2em;
}
.svg-inline--fa.fa-xl {
  vertical-align: -0.25em;
}
.svg-inline--fa.fa-2xl {
  vertical-align: -0.3125em;
}
.svg-inline--fa.fa-pull-left,
.svg-inline--fa .fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-pull-right,
.svg-inline--fa .fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-li {
  width: var(--fa-li-width, 2em);
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  inset-block-start: 0.25em; /* syncing vertical alignment with Web Font rendering */
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.fa-layers .svg-inline--fa {
  inset: 0;
  margin: auto;
  position: absolute;
  transform-origin: center center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center center;
}

.fa-layers-counter {
  background-color: var(--fa-counter-background-color, #ff253a);
  border-radius: var(--fa-counter-border-radius, 1em);
  box-sizing: border-box;
  color: var(--fa-inverse, #fff);
  line-height: var(--fa-counter-line-height, 1);
  max-width: var(--fa-counter-max-width, 5em);
  min-width: var(--fa-counter-min-width, 1.5em);
  overflow: hidden;
  padding: var(--fa-counter-padding, 0.25em 0.5em);
  right: var(--fa-right, 0);
  text-overflow: ellipsis;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-counter-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: var(--fa-bottom, 0);
  right: var(--fa-right, 0);
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: var(--fa-bottom, 0);
  left: var(--fa-left, 0);
  right: auto;
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom left;
}

.fa-layers-top-right {
  top: var(--fa-top, 0);
  right: var(--fa-right, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-top-left {
  left: var(--fa-left, 0);
  right: auto;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top left;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-2xs {
  font-size: calc(10 / 16 * 1em); /* converts a 10px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 10 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 10 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xs {
  font-size: calc(12 / 16 * 1em); /* converts a 12px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 12 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 12 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-sm {
  font-size: calc(14 / 16 * 1em); /* converts a 14px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 14 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 14 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-lg {
  font-size: calc(20 / 16 * 1em); /* converts a 20px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 20 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 20 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xl {
  font-size: calc(24 / 16 * 1em); /* converts a 24px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 24 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 24 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-2xl {
  font-size: calc(32 / 16 * 1em); /* converts a 32px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 32 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 32 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-width-auto {
  --fa-width: auto;
}

.fa-fw,
.fa-width-fixed {
  --fa-width: 1.25em;
}

.fa-ul {
  list-style-type: none;
  margin-inline-start: var(--fa-li-margin, 2.5em);
  padding-inline-start: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  position: absolute;
  text-align: center;
  width: var(--fa-li-width, 2em);
  line-height: inherit;
}

/* Heads Up: Bordered Icons will not be supported in the future!
  - This feature will be deprecated in the next major release of Font Awesome (v8)!
  - You may continue to use it in this version *v7), but it will not be supported in Font Awesome v8.
*/
/* Notes:
* --@{v.$css-prefix}-border-width = 1/16 by default (to render as ~1px based on a 16px default font-size)
* --@{v.$css-prefix}-border-padding =
  ** 3/16 for vertical padding (to give ~2px of vertical whitespace around an icon considering it's vertical alignment)
  ** 4/16 for horizontal padding (to give ~4px of horizontal whitespace around an icon)
*/
.fa-border {
  border-color: var(--fa-border-color, #eee);
  border-radius: var(--fa-border-radius, 0.1em);
  border-style: var(--fa-border-style, solid);
  border-width: var(--fa-border-width, 0.0625em);
  box-sizing: var(--fa-border-box-sizing, content-box);
  padding: var(--fa-border-padding, 0.1875em 0.25em);
}

.fa-pull-left,
.fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}

.fa-pull-right,
.fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}

.fa-beat {
  animation-name: fa-beat;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-bounce {
  animation-name: fa-bounce;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
}

.fa-fade {
  animation-name: fa-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-beat-fade {
  animation-name: fa-beat-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-flip {
  animation-name: fa-flip;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-shake {
  animation-name: fa-shake;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin {
  animation-name: fa-spin;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-reverse {
  --fa-animation-direction: reverse;
}

.fa-pulse,
.fa-spin-pulse {
  animation-name: fa-spin;
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, steps(8));
}

@media (prefers-reduced-motion: reduce) {
  .fa-beat,
  .fa-bounce,
  .fa-fade,
  .fa-beat-fade,
  .fa-flip,
  .fa-pulse,
  .fa-shake,
  .fa-spin,
  .fa-spin-pulse {
    animation: none !important;
    transition: none !important;
  }
}
@keyframes fa-beat {
  0%, 90% {
    transform: scale(1);
  }
  45% {
    transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@keyframes fa-bounce {
  0% {
    transform: scale(1, 1) translateY(0);
  }
  10% {
    transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    transform: scale(1, 1) translateY(0);
  }
  100% {
    transform: scale(1, 1) translateY(0);
  }
}
@keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@keyframes fa-flip {
  50% {
    transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@keyframes fa-shake {
  0% {
    transform: rotate(-15deg);
  }
  4% {
    transform: rotate(15deg);
  }
  8%, 24% {
    transform: rotate(-18deg);
  }
  12%, 28% {
    transform: rotate(18deg);
  }
  16% {
    transform: rotate(-22deg);
  }
  20% {
    transform: rotate(22deg);
  }
  32% {
    transform: rotate(-12deg);
  }
  36% {
    transform: rotate(12deg);
  }
  40%, 100% {
    transform: rotate(0deg);
  }
}
@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.fa-rotate-90 {
  transform: rotate(90deg);
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

.fa-rotate-270 {
  transform: rotate(270deg);
}

.fa-flip-horizontal {
  transform: scale(-1, 1);
}

.fa-flip-vertical {
  transform: scale(1, -1);
}

.fa-flip-both,
.fa-flip-horizontal.fa-flip-vertical {
  transform: scale(-1, -1);
}

.fa-rotate-by {
  transform: rotate(var(--fa-rotate-angle, 0));
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}

.svg-inline--fa.fa-inverse {
  fill: var(--fa-inverse, #fff);
}

.fa-stack {
  display: inline-block;
  height: 2em;
  line-height: 2em;
  position: relative;
  vertical-align: middle;
  width: 2.5em;
}

.fa-inverse {
  color: var(--fa-inverse, #fff);
}

.svg-inline--fa.fa-stack-1x {
  --fa-width: 1.25em;
  height: 1em;
  width: var(--fa-width);
}
.svg-inline--fa.fa-stack-2x {
  --fa-width: 2.5em;
  height: 2em;
  width: var(--fa-width);
}

.fa-stack-1x,
.fa-stack-2x {
  inset: 0;
  margin: auto;
  position: absolute;
  z-index: var(--fa-stack-z-index, auto);
}`;function k3(){var c=C3,l=h3,a=M.cssPrefix,e=M.replacementClass,r=l6;if(a!==c||e!==l){var i=new RegExp("\\.".concat(c,"\\-"),"g"),s=new RegExp("\\--".concat(c,"\\-"),"g"),f=new RegExp("\\.".concat(l),"g");r=r.replace(i,".".concat(a,"-")).replace(s,"--".concat(a,"-")).replace(f,".".concat(e))}return r}var y2=!1;function x1(){M.autoAddCss&&!y2&&(J0(k3()),y2=!0)}var e6={mixout:function(){return{dom:{css:k3,insertCss:x1}}},hooks:function(){return{beforeDOMElementCreation:function(){x1()},beforeI2svg:function(){x1()}}}},T=R||{};T[F]||(T[F]={});T[F].styles||(T[F].styles={});T[F].hooks||(T[F].hooks={});T[F].shims||(T[F].shims=[]);var k=T[F],w3=[],A3=function(){L.removeEventListener("DOMContentLoaded",A3),f1=1,w3.map(function(l){return l()})},f1=!1;D&&(f1=(L.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(L.readyState),f1||L.addEventListener("DOMContentLoaded",A3));function r6(c){D&&(f1?setTimeout(c,0):w3.push(c))}function Z(c){var l=c.tag,a=c.attributes,e=a===void 0?{}:a,r=c.children,i=r===void 0?[]:r;return typeof c=="string"?y3(c):"<".concat(l," ").concat(Z0(e),">").concat(i.map(Z).join(""),"</").concat(l,">")}function k2(c,l,a){if(c&&c[l]&&c[l][a])return{prefix:l,iconName:a,icon:c[l][a]}}var i6=function(l,a){return function(e,r,i,s){return l.call(a,e,r,i,s)}},b1=function(l,a,e,r){var i=Object.keys(l),s=i.length,f=r!==void 0?i6(a,r):a,n,t,m;for(e===void 0?(n=1,m=l[i[0]]):(n=0,m=e);n<s;n++)t=i[n],m=f(m,l[t],t,l);return m};function P3(c){return w(c).length!==1?null:c.codePointAt(0).toString(16)}function w2(c){return Object.keys(c).reduce(function(l,a){var e=c[a],r=!!e.icon;return r?l[e.iconName]=e.icon:l[a]=e,l},{})}function D1(c,l){var a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},e=a.skipHooks,r=e===void 0?!1:e,i=w2(l);typeof k.hooks.addPack=="function"&&!r?k.hooks.addPack(c,w2(l)):k.styles[c]=o(o({},k.styles[c]||{}),i),c==="fas"&&D1("fa",l)}var K=k.styles,s6=k.shims,F3=Object.keys(V1),f6=F3.reduce(function(c,l){return c[l]=Object.keys(V1[l]),c},{}),X1=null,T3={},D3={},B3={},R3={},H3={};function n6(c){return~$0.indexOf(c)}function o6(c,l){var a=l.split("-"),e=a[0],r=a.slice(1).join("-");return e===c&&r!==""&&!n6(r)?r:null}var q3=function(){var l=function(i){return b1(K,function(s,f,n){return s[n]=b1(f,i,{}),s},{})};T3=l(function(r,i,s){if(i[3]&&(r[i[3]]=s),i[2]){var f=i[2].filter(function(n){return typeof n=="number"});f.forEach(function(n){r[n.toString(16)]=s})}return r}),D3=l(function(r,i,s){if(r[s]=s,i[2]){var f=i[2].filter(function(n){return typeof n=="string"});f.forEach(function(n){r[n]=s})}return r}),H3=l(function(r,i,s){var f=i[2];return r[s]=s,f.forEach(function(n){r[n]=s}),r});var a="far"in K||M.autoFetchSvg,e=b1(s6,function(r,i){var s=i[0],f=i[1],n=i[2];return f==="far"&&!a&&(f="fas"),typeof s=="string"&&(r.names[s]={prefix:f,iconName:n}),typeof s=="number"&&(r.unicodes[s.toString(16)]={prefix:f,iconName:n}),r},{names:{},unicodes:{}});B3=e.names,R3=e.unicodes,X1=z1(M.styleDefault,{family:M.familyDefault})};K0(function(c){X1=z1(c.styleDefault,{family:M.familyDefault})});q3();function Y1(c,l){return(T3[c]||{})[l]}function t6(c,l){return(D3[c]||{})[l]}function U(c,l){return(H3[c]||{})[l]}function E3(c){return B3[c]||{prefix:null,iconName:null}}function z6(c){var l=R3[c],a=Y1("fas",c);return l||(a?{prefix:"fas",iconName:a}:null)||{prefix:null,iconName:null}}function H(){return X1}var U3=function(){return{prefix:null,iconName:null,rest:[]}};function m6(c){var l=g,a=F3.reduce(function(e,r){return e[r]="".concat(M.cssPrefix,"-").concat(r),e},{});return u3.forEach(function(e){(c.includes(a[e])||c.some(function(r){return f6[e].includes(r)}))&&(l=e)}),l}function z1(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=l.family,e=a===void 0?g:a,r=G0[e][c];if(e===J&&!c)return"fad";var i=b2[e][c]||b2[e][r],s=c in k.styles?c:null,f=i||s||null;return f}function M6(c){var l=[],a=null;return c.forEach(function(e){var r=o6(M.cssPrefix,e);r?a=r:e&&l.push(e)}),{iconName:a,rest:l}}function A2(c){return c.sort().filter(function(l,a,e){return e.indexOf(l)===a})}var P2=L3.concat(d3);function m1(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=l.skipLookups,e=a===void 0?!1:a,r=null,i=A2(c.filter(function(u){return P2.includes(u)})),s=A2(c.filter(function(u){return!P2.includes(u)})),f=i.filter(function(u){return r=u,!Q2.includes(u)}),n=o1(f,1),t=n[0],m=t===void 0?null:t,z=m6(i),d=o(o({},M6(s)),{},{prefix:z1(m,{family:z})});return o(o(o({},d),L6({values:c,family:z,styles:K,config:M,canonical:d,givenPrefix:r})),p6(e,r,d))}function p6(c,l,a){var e=a.prefix,r=a.iconName;if(c||!e||!r)return{prefix:e,iconName:r};var i=l==="fa"?E3(r):{},s=U(e,r);return r=i.iconName||s||r,e=i.prefix||e,e==="far"&&!K.far&&K.fas&&!M.autoFetchSvg&&(e="fas"),{prefix:e,iconName:r}}var u6=u3.filter(function(c){return c!==g||c!==J}),d6=Object.keys(k1).filter(function(c){return c!==g}).map(function(c){return Object.keys(k1[c])}).flat();function L6(c){var l=c.values,a=c.family,e=c.canonical,r=c.givenPrefix,i=r===void 0?"":r,s=c.styles,f=s===void 0?{}:s,n=c.config,t=n===void 0?{}:n,m=a===J,z=l.includes("fa-duotone")||l.includes("fad"),d=t.familyDefault==="duotone",u=e.prefix==="fad"||e.prefix==="fa-duotone";if(!m&&(z||d||u)&&(e.prefix="fad"),(l.includes("fa-brands")||l.includes("fab"))&&(e.prefix="fab"),!e.prefix&&u6.includes(a)){var C=Object.keys(f).find(function(x){return d6.includes(x)});if(C||t.autoFetchSvg){var v=B4.get(a).defaultShortPrefixId;e.prefix=v,e.iconName=U(e.prefix,e.iconName)||e.iconName}}return(e.prefix==="fa"||i==="fa")&&(e.prefix=H()||"fas"),e}var v6=(function(){function c(){e4(this,c),this.definitions={}}return r4(c,[{key:"add",value:function(){for(var a=this,e=arguments.length,r=new Array(e),i=0;i<e;i++)r[i]=arguments[i];var s=r.reduce(this._pullDefinitions,{});Object.keys(s).forEach(function(f){a.definitions[f]=o(o({},a.definitions[f]||{}),s[f]),D1(f,s[f]);var n=V1[g][f];n&&D1(n,s[f]),q3()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(a,e){var r=e.prefix&&e.iconName&&e.icon?{0:e}:e;return Object.keys(r).map(function(i){var s=r[i],f=s.prefix,n=s.iconName,t=s.icon,m=t[2];a[f]||(a[f]={}),m.length>0&&m.forEach(function(z){typeof z=="string"&&(a[f][z]=t)}),a[f][n]=t}),a}}])})(),F2=[],O={},j={},C6=Object.keys(j);function h6(c,l){var a=l.mixoutsTo;return F2=c,O={},Object.keys(j).forEach(function(e){C6.indexOf(e)===-1&&delete j[e]}),F2.forEach(function(e){var r=e.mixout?e.mixout():{};if(Object.keys(r).forEach(function(s){typeof r[s]=="function"&&(a[s]=r[s]),s1(r[s])==="object"&&Object.keys(r[s]).forEach(function(f){a[s]||(a[s]={}),a[s][f]=r[s][f]})}),e.hooks){var i=e.hooks();Object.keys(i).forEach(function(s){O[s]||(O[s]=[]),O[s].push(i[s])})}e.provides&&e.provides(j)}),a}function B1(c,l){for(var a=arguments.length,e=new Array(a>2?a-2:0),r=2;r<a;r++)e[r-2]=arguments[r];var i=O[c]||[];return i.forEach(function(s){l=s.apply(null,[l].concat(e))}),l}function W(c){for(var l=arguments.length,a=new Array(l>1?l-1:0),e=1;e<l;e++)a[e-1]=arguments[e];var r=O[c]||[];r.forEach(function(i){i.apply(null,a)})}function q(){var c=arguments[0],l=Array.prototype.slice.call(arguments,1);return j[c]?j[c].apply(null,l):void 0}function R1(c){c.prefix==="fa"&&(c.prefix="fas");var l=c.iconName,a=c.prefix||H();if(l)return l=U(a,l)||l,k2(I3.definitions,a,l)||k2(k.styles,a,l)}var I3=new v6,g6=function(){M.autoReplaceSvg=!1,M.observeMutations=!1,W("noAuto")},x6={i2svg:function(){var l=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return D?(W("beforeI2svg",l),q("pseudoElements2svg",l),q("i2svg",l)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){var l=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},a=l.autoReplaceSvgRoot;M.autoReplaceSvg===!1&&(M.autoReplaceSvg=!0),M.observeMutations=!0,r6(function(){N6({autoReplaceSvgRoot:a}),W("watch",l)})}},b6={icon:function(l){if(l===null)return null;if(s1(l)==="object"&&l.prefix&&l.iconName)return{prefix:l.prefix,iconName:U(l.prefix,l.iconName)||l.iconName};if(Array.isArray(l)&&l.length===2){var a=l[1].indexOf("fa-")===0?l[1].slice(3):l[1],e=z1(l[0]);return{prefix:e,iconName:U(e,a)||a}}if(typeof l=="string"&&(l.indexOf("".concat(M.cssPrefix,"-"))>-1||l.match(O0))){var r=m1(l.split(" "),{skipLookups:!0});return{prefix:r.prefix||H(),iconName:U(r.prefix,r.iconName)||r.iconName}}if(typeof l=="string"){var i=H();return{prefix:i,iconName:U(i,l)||l}}}},S={noAuto:g6,config:M,dom:x6,parse:b6,library:I3,findIconDefinition:R1,toHtml:Z},N6=function(){var l=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},a=l.autoReplaceSvgRoot,e=a===void 0?L:a;(Object.keys(k.styles).length>0||M.autoFetchSvg)&&D&&M.autoReplaceSvg&&S.dom.i2svg({node:e})};function M1(c,l){return Object.defineProperty(c,"abstract",{get:l}),Object.defineProperty(c,"html",{get:function(){return c.abstract.map(function(e){return Z(e)})}}),Object.defineProperty(c,"node",{get:function(){if(D){var e=L.createElement("div");return e.innerHTML=c.html,e.children}}}),c}function S6(c){var l=c.children,a=c.main,e=c.mask,r=c.attributes,i=c.styles,s=c.transform;if($1(s)&&a.found&&!e.found){var f=a.width,n=a.height,t={x:f/n/2,y:.5};r.style=t1(o(o({},i),{},{"transform-origin":"".concat(t.x+s.x/16,"em ").concat(t.y+s.y/16,"em")}))}return[{tag:"svg",attributes:r,children:l}]}function y6(c){var l=c.prefix,a=c.iconName,e=c.children,r=c.attributes,i=c.symbol,s=i===!0?"".concat(l,"-").concat(M.cssPrefix,"-").concat(a):i;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:o(o({},r),{},{id:s}),children:e}]}]}function k6(c){var l=["aria-label","aria-labelledby","title","role"];return l.some(function(a){return a in c})}function K1(c){var l=c.icons,a=l.main,e=l.mask,r=c.prefix,i=c.iconName,s=c.transform,f=c.symbol,n=c.maskId,t=c.extra,m=c.watchable,z=m===void 0?!1:m,d=e.found?e:a,u=d.width,C=d.height,v=[M.replacementClass,i?"".concat(M.cssPrefix,"-").concat(i):""].filter(function(P){return t.classes.indexOf(P)===-1}).filter(function(P){return P!==""||!!P}).concat(t.classes).join(" "),x={children:[],attributes:o(o({},t.attributes),{},{"data-prefix":r,"data-icon":i,class:v,role:t.attributes.role||"img",viewBox:"0 0 ".concat(u," ").concat(C)})};!k6(t.attributes)&&!t.attributes["aria-hidden"]&&(x.attributes["aria-hidden"]="true"),z&&(x.attributes[I]="");var h=o(o({},x),{},{prefix:r,iconName:i,main:a,mask:e,maskId:n,transform:s,symbol:f,styles:o({},t.styles)}),N=e.found&&a.found?q("generateAbstractMask",h)||{children:[],attributes:{}}:q("generateAbstractIcon",h)||{children:[],attributes:{}},y=N.children,G=N.attributes;return h.children=y,h.attributes=G,f?y6(h):S6(h)}function T2(c){var l=c.content,a=c.width,e=c.height,r=c.transform,i=c.extra,s=c.watchable,f=s===void 0?!1:s,n=o(o({},i.attributes),{},{class:i.classes.join(" ")});f&&(n[I]="");var t=o({},i.styles);$1(r)&&(t.transform=a6({transform:r,startCentered:!0,width:a,height:e}),t["-webkit-transform"]=t.transform);var m=t1(t);m.length>0&&(n.style=m);var z=[];return z.push({tag:"span",attributes:n,children:[l]}),z}function w6(c){var l=c.content,a=c.extra,e=o(o({},a.attributes),{},{class:a.classes.join(" ")}),r=t1(a.styles);r.length>0&&(e.style=r);var i=[];return i.push({tag:"span",attributes:e,children:[l]}),i}var N1=k.styles;function H1(c){var l=c[0],a=c[1],e=c.slice(4),r=o1(e,1),i=r[0],s=null;return Array.isArray(i)?s={tag:"g",attributes:{class:"".concat(M.cssPrefix,"-").concat(g1.GROUP)},children:[{tag:"path",attributes:{class:"".concat(M.cssPrefix,"-").concat(g1.SECONDARY),fill:"currentColor",d:i[0]}},{tag:"path",attributes:{class:"".concat(M.cssPrefix,"-").concat(g1.PRIMARY),fill:"currentColor",d:i[1]}}]}:s={tag:"path",attributes:{fill:"currentColor",d:i}},{found:!0,width:l,height:a,icon:s}}var A6={found:!1,width:512,height:512};function P6(c,l){!x3&&!M.showMissingIcons&&c&&console.error('Icon with name "'.concat(c,'" and prefix "').concat(l,'" is missing.'))}function q1(c,l){var a=l;return l==="fa"&&M.styleDefault!==null&&(l=H()),new Promise(function(e,r){if(a==="fa"){var i=E3(c)||{};c=i.iconName||c,l=i.prefix||l}if(c&&l&&N1[l]&&N1[l][c]){var s=N1[l][c];return e(H1(s))}P6(c,l),e(o(o({},A6),{},{icon:M.showMissingIcons&&c?q("missingIconAbstract")||{}:{}}))})}var D2=function(){},E1=M.measurePerformance&&a1&&a1.mark&&a1.measure?a1:{mark:D2,measure:D2},$='FA "7.1.0"',F6=function(l){return E1.mark("".concat($," ").concat(l," begins")),function(){return W3(l)}},W3=function(l){E1.mark("".concat($," ").concat(l," ends")),E1.measure("".concat($," ").concat(l),"".concat($," ").concat(l," begins"),"".concat($," ").concat(l," ends"))},J1={begin:F6,end:W3},r1=function(){};function B2(c){var l=c.getAttribute?c.getAttribute(I):null;return typeof l=="string"}function T6(c){var l=c.getAttribute?c.getAttribute(O1):null,a=c.getAttribute?c.getAttribute(j1):null;return l&&a}function D6(c){return c&&c.classList&&c.classList.contains&&c.classList.contains(M.replacementClass)}function B6(){if(M.autoReplaceSvg===!0)return i1.replace;var c=i1[M.autoReplaceSvg];return c||i1.replace}function R6(c){return L.createElementNS("http://www.w3.org/2000/svg",c)}function H6(c){return L.createElement(c)}function G3(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=l.ceFn,e=a===void 0?c.tag==="svg"?R6:H6:a;if(typeof c=="string")return L.createTextNode(c);var r=e(c.tag);Object.keys(c.attributes||[]).forEach(function(s){r.setAttribute(s,c.attributes[s])});var i=c.children||[];return i.forEach(function(s){r.appendChild(G3(s,{ceFn:e}))}),r}function q6(c){var l=" ".concat(c.outerHTML," ");return l="".concat(l,"Font Awesome fontawesome.com "),l}var i1={replace:function(l){var a=l[0];if(a.parentNode)if(l[1].forEach(function(r){a.parentNode.insertBefore(G3(r),a)}),a.getAttribute(I)===null&&M.keepOriginalSource){var e=L.createComment(q6(a));a.parentNode.replaceChild(e,a)}else a.remove()},nest:function(l){var a=l[0],e=l[1];if(~_1(a).indexOf(M.replacementClass))return i1.replace(l);var r=new RegExp("".concat(M.cssPrefix,"-.*"));if(delete e[0].attributes.id,e[0].attributes.class){var i=e[0].attributes.class.split(" ").reduce(function(f,n){return n===M.replacementClass||n.match(r)?f.toSvg.push(n):f.toNode.push(n),f},{toNode:[],toSvg:[]});e[0].attributes.class=i.toSvg.join(" "),i.toNode.length===0?a.removeAttribute("class"):a.setAttribute("class",i.toNode.join(" "))}var s=e.map(function(f){return Z(f)}).join(`
`);a.setAttribute(I,""),a.innerHTML=s}};function R2(c){c()}function O3(c,l){var a=typeof l=="function"?l:r1;if(c.length===0)a();else{var e=R2;M.mutateApproach===I0&&(e=R.requestAnimationFrame||R2),e(function(){var r=B6(),i=J1.begin("mutate");c.map(r),i(),a()})}}var Q1=!1;function j3(){Q1=!0}function U1(){Q1=!1}var n1=null;function H2(c){if(C2&&M.observeMutations){var l=c.treeCallback,a=l===void 0?r1:l,e=c.nodeCallback,r=e===void 0?r1:e,i=c.pseudoElementsCallback,s=i===void 0?r1:i,f=c.observeMutationsRoot,n=f===void 0?L:f;n1=new C2(function(t){if(!Q1){var m=H();_(t).forEach(function(z){if(z.type==="childList"&&z.addedNodes.length>0&&!B2(z.addedNodes[0])&&(M.searchPseudoElements&&s(z.target),a(z.target)),z.type==="attributes"&&z.target.parentNode&&M.searchPseudoElements&&s([z.target],!0),z.type==="attributes"&&B2(z.target)&&~_0.indexOf(z.attributeName))if(z.attributeName==="class"&&T6(z.target)){var d=m1(_1(z.target)),u=d.prefix,C=d.iconName;z.target.setAttribute(O1,u||m),C&&z.target.setAttribute(j1,C)}else D6(z.target)&&r(z.target)})}}),D&&n1.observe(n,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}}function E6(){n1&&n1.disconnect()}function U6(c){var l=c.getAttribute("style"),a=[];return l&&(a=l.split(";").reduce(function(e,r){var i=r.split(":"),s=i[0],f=i.slice(1);return s&&f.length>0&&(e[s]=f.join(":").trim()),e},{})),a}function I6(c){var l=c.getAttribute("data-prefix"),a=c.getAttribute("data-icon"),e=c.innerText!==void 0?c.innerText.trim():"",r=m1(_1(c));return r.prefix||(r.prefix=H()),l&&a&&(r.prefix=l,r.iconName=a),r.iconName&&r.prefix||(r.prefix&&e.length>0&&(r.iconName=t6(r.prefix,c.innerText)||Y1(r.prefix,P3(c.innerText))),!r.iconName&&M.autoFetchSvg&&c.firstChild&&c.firstChild.nodeType===Node.TEXT_NODE&&(r.iconName=c.firstChild.data)),r}function W6(c){var l=_(c.attributes).reduce(function(a,e){return a.name!=="class"&&a.name!=="style"&&(a[e.name]=e.value),a},{});return l}function G6(){return{iconName:null,prefix:null,transform:A,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function q2(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0},a=I6(c),e=a.iconName,r=a.prefix,i=a.rest,s=W6(c),f=B1("parseNodeAttributes",{},c),n=l.styleParser?U6(c):[];return o({iconName:e,prefix:r,transform:A,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:i,styles:n,attributes:s}},f)}var O6=k.styles;function V3(c){var l=M.autoReplaceSvg==="nest"?q2(c,{styleParser:!1}):q2(c);return~l.extra.classes.indexOf(N3)?q("generateLayersText",c,l):q("generateSvgReplacementMutation",c,l)}function j6(){return[].concat(w(d3),w(L3))}function E2(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!D)return Promise.resolve();var a=L.documentElement.classList,e=function(z){return a.add("".concat(x2,"-").concat(z))},r=function(z){return a.remove("".concat(x2,"-").concat(z))},i=M.autoFetchSvg?j6():Q2.concat(Object.keys(O6));i.includes("fa")||i.push("fa");var s=[".".concat(N3,":not([").concat(I,"])")].concat(i.map(function(m){return".".concat(m,":not([").concat(I,"])")})).join(", ");if(s.length===0)return Promise.resolve();var f=[];try{f=_(c.querySelectorAll(s))}catch{}if(f.length>0)e("pending"),r("complete");else return Promise.resolve();var n=J1.begin("onTree"),t=f.reduce(function(m,z){try{var d=V3(z);d&&m.push(d)}catch(u){x3||u.name==="MissingIcon"&&console.error(u)}return m},[]);return new Promise(function(m,z){Promise.all(t).then(function(d){O3(d,function(){e("active"),e("complete"),r("pending"),typeof l=="function"&&l(),n(),m()})}).catch(function(d){n(),z(d)})})}function V6(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;V3(c).then(function(a){a&&O3([a],l)})}function _6(c){return function(l){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},e=(l||{}).icon?l:R1(l||{}),r=a.mask;return r&&(r=(r||{}).icon?r:R1(r||{})),c(e,o(o({},a),{},{mask:r}))}}var $6=function(l){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},e=a.transform,r=e===void 0?A:e,i=a.symbol,s=i===void 0?!1:i,f=a.mask,n=f===void 0?null:f,t=a.maskId,m=t===void 0?null:t,z=a.classes,d=z===void 0?[]:z,u=a.attributes,C=u===void 0?{}:u,v=a.styles,x=v===void 0?{}:v;if(l){var h=l.prefix,N=l.iconName,y=l.icon;return M1(o({type:"icon"},l),function(){return W("beforeDOMElementCreation",{iconDefinition:l,params:a}),K1({icons:{main:H1(y),mask:n?H1(n.icon):{found:!1,width:null,height:null,icon:{}}},prefix:h,iconName:N,transform:o(o({},A),r),symbol:s,maskId:m,extra:{attributes:C,styles:x,classes:d}})})}},X6={mixout:function(){return{icon:_6($6)}},hooks:function(){return{mutationObserverCallbacks:function(a){return a.treeCallback=E2,a.nodeCallback=V6,a}}},provides:function(l){l.i2svg=function(a){var e=a.node,r=e===void 0?L:e,i=a.callback,s=i===void 0?function(){}:i;return E2(r,s)},l.generateSvgReplacementMutation=function(a,e){var r=e.iconName,i=e.prefix,s=e.transform,f=e.symbol,n=e.mask,t=e.maskId,m=e.extra;return new Promise(function(z,d){Promise.all([q1(r,i),n.iconName?q1(n.iconName,n.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(function(u){var C=o1(u,2),v=C[0],x=C[1];z([a,K1({icons:{main:v,mask:x},prefix:i,iconName:r,transform:s,symbol:f,maskId:t,extra:m,watchable:!0})])}).catch(d)})},l.generateAbstractIcon=function(a){var e=a.children,r=a.attributes,i=a.main,s=a.transform,f=a.styles,n=t1(f);n.length>0&&(r.style=n);var t;return $1(s)&&(t=q("generateAbstractTransformGrouping",{main:i,transform:s,containerWidth:i.width,iconWidth:i.width})),e.push(t||i.icon),{children:e,attributes:r}}}},Y6={mixout:function(){return{layer:function(a){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=e.classes,i=r===void 0?[]:r;return M1({type:"layer"},function(){W("beforeDOMElementCreation",{assembler:a,params:e});var s=[];return a(function(f){Array.isArray(f)?f.map(function(n){s=s.concat(n.abstract)}):s=s.concat(f.abstract)}),[{tag:"span",attributes:{class:["".concat(M.cssPrefix,"-layers")].concat(w(i)).join(" ")},children:s}]})}}}},K6={mixout:function(){return{counter:function(a){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=e.title,i=r===void 0?null:r,s=e.classes,f=s===void 0?[]:s,n=e.attributes,t=n===void 0?{}:n,m=e.styles,z=m===void 0?{}:m;return M1({type:"counter",content:a},function(){return W("beforeDOMElementCreation",{content:a,params:e}),w6({content:a.toString(),title:i,extra:{attributes:t,styles:z,classes:["".concat(M.cssPrefix,"-layers-counter")].concat(w(f))}})})}}}},J6={mixout:function(){return{text:function(a){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=e.transform,i=r===void 0?A:r,s=e.classes,f=s===void 0?[]:s,n=e.attributes,t=n===void 0?{}:n,m=e.styles,z=m===void 0?{}:m;return M1({type:"text",content:a},function(){return W("beforeDOMElementCreation",{content:a,params:e}),T2({content:a,transform:o(o({},A),i),extra:{attributes:t,styles:z,classes:["".concat(M.cssPrefix,"-layers-text")].concat(w(f))}})})}}},provides:function(l){l.generateLayersText=function(a,e){var r=e.transform,i=e.extra,s=null,f=null;if(K2){var n=parseInt(getComputedStyle(a).fontSize,10),t=a.getBoundingClientRect();s=t.width/n,f=t.height/n}return Promise.resolve([a,T2({content:a.innerHTML,width:s,height:f,transform:r,extra:i,watchable:!0})])}}},_3=new RegExp('"',"ug"),U2=[1105920,1112319],I2=o(o(o(o({},{FontAwesome:{normal:"fas",400:"fas"}}),D4),E0),G4),I1=Object.keys(I2).reduce(function(c,l){return c[l.toLowerCase()]=I2[l],c},{}),Q6=Object.keys(I1).reduce(function(c,l){var a=I1[l];return c[l]=a[900]||w(Object.entries(a))[0][1],c},{});function Z6(c){var l=c.replace(_3,"");return P3(w(l)[0]||"")}function c5(c){var l=c.getPropertyValue("font-feature-settings").includes("ss01"),a=c.getPropertyValue("content"),e=a.replace(_3,""),r=e.codePointAt(0),i=r>=U2[0]&&r<=U2[1],s=e.length===2?e[0]===e[1]:!1;return i||s||l}function a5(c,l){var a=c.replace(/^['"]|['"]$/g,"").toLowerCase(),e=parseInt(l),r=isNaN(e)?"normal":e;return(I1[a]||{})[r]||Q6[a]}function W2(c,l){var a="".concat(U0).concat(l.replace(":","-"));return new Promise(function(e,r){if(c.getAttribute(a)!==null)return e();var i=_(c.children),s=i.filter(function(p1){return p1.getAttribute(A1)===l})[0],f=R.getComputedStyle(c,l),n=f.getPropertyValue("font-family"),t=n.match(j0),m=f.getPropertyValue("font-weight"),z=f.getPropertyValue("content");if(s&&!t)return c.removeChild(s),e();if(t&&z!=="none"&&z!==""){var d=f.getPropertyValue("content"),u=a5(n,m),C=Z6(d),v=t[0].startsWith("FontAwesome"),x=c5(f),h=Y1(u,C),N=h;if(v){var y=z6(C);y.iconName&&y.prefix&&(h=y.iconName,u=y.prefix)}if(h&&!x&&(!s||s.getAttribute(O1)!==u||s.getAttribute(j1)!==N)){c.setAttribute(a,N),s&&c.removeChild(s);var G=G6(),P=G.extra;P.attributes[A1]=l,q1(h,u).then(function(p1){var Z3=K1(o(o({},G),{},{icons:{main:p1,mask:U3()},prefix:u,iconName:N,extra:P,watchable:!0})),u1=L.createElementNS("http://www.w3.org/2000/svg","svg");l==="::before"?c.insertBefore(u1,c.firstChild):c.appendChild(u1),u1.outerHTML=Z3.map(function(c4){return Z(c4)}).join(`
`),c.removeAttribute(a),e()}).catch(r)}else e()}else e()})}function l5(c){return Promise.all([W2(c,"::before"),W2(c,"::after")])}function e5(c){return c.parentNode!==document.head&&!~W0.indexOf(c.tagName.toUpperCase())&&!c.getAttribute(A1)&&(!c.parentNode||c.parentNode.tagName!=="svg")}var r5=function(l){return!!l&&g3.some(function(a){return l.includes(a)})},i5=function(l){if(!l)return[];var a=new Set,e=l.split(/,(?![^()]*\))/).map(function(n){return n.trim()});e=e.flatMap(function(n){return n.includes("(")?n:n.split(",").map(function(t){return t.trim()})});var r=e1(e),i;try{for(r.s();!(i=r.n()).done;){var s=i.value;if(r5(s)){var f=g3.reduce(function(n,t){return n.replace(t,"")},s);f!==""&&f!=="*"&&a.add(f)}}}catch(n){r.e(n)}finally{r.f()}return a};function G2(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;if(D){var a;if(l)a=c;else if(M.searchPseudoElementsFullScan)a=c.querySelectorAll("*");else{var e=new Set,r=e1(document.styleSheets),i;try{for(r.s();!(i=r.n()).done;){var s=i.value;try{var f=e1(s.cssRules),n;try{for(f.s();!(n=f.n()).done;){var t=n.value,m=i5(t.selectorText),z=e1(m),d;try{for(z.s();!(d=z.n()).done;){var u=d.value;e.add(u)}}catch(v){z.e(v)}finally{z.f()}}}catch(v){f.e(v)}finally{f.f()}}catch(v){M.searchPseudoElementsWarnings&&console.warn("Font Awesome: cannot parse stylesheet: ".concat(s.href," (").concat(v.message,`)
If it declares any Font Awesome CSS pseudo-elements, they will not be rendered as SVG icons. Add crossorigin="anonymous" to the <link>, enable searchPseudoElementsFullScan for slower but more thorough DOM parsing, or suppress this warning by setting searchPseudoElementsWarnings to false.`))}}}catch(v){r.e(v)}finally{r.f()}if(!e.size)return;var C=Array.from(e).join(", ");try{a=c.querySelectorAll(C)}catch{}}return new Promise(function(v,x){var h=_(a).filter(e5).map(l5),N=J1.begin("searchPseudoElements");j3(),Promise.all(h).then(function(){N(),U1(),v()}).catch(function(){N(),U1(),x()})})}}var s5={hooks:function(){return{mutationObserverCallbacks:function(a){return a.pseudoElementsCallback=G2,a}}},provides:function(l){l.pseudoElements2svg=function(a){var e=a.node,r=e===void 0?L:e;M.searchPseudoElements&&G2(r)}}},O2=!1,f5={mixout:function(){return{dom:{unwatch:function(){j3(),O2=!0}}}},hooks:function(){return{bootstrap:function(){H2(B1("mutationObserverCallbacks",{}))},noAuto:function(){E6()},watch:function(a){var e=a.observeMutationsRoot;O2?U1():H2(B1("mutationObserverCallbacks",{observeMutationsRoot:e}))}}}},j2=function(l){var a={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return l.toLowerCase().split(" ").reduce(function(e,r){var i=r.toLowerCase().split("-"),s=i[0],f=i.slice(1).join("-");if(s&&f==="h")return e.flipX=!0,e;if(s&&f==="v")return e.flipY=!0,e;if(f=parseFloat(f),isNaN(f))return e;switch(s){case"grow":e.size=e.size+f;break;case"shrink":e.size=e.size-f;break;case"left":e.x=e.x-f;break;case"right":e.x=e.x+f;break;case"up":e.y=e.y-f;break;case"down":e.y=e.y+f;break;case"rotate":e.rotate=e.rotate+f;break}return e},a)},n5={mixout:function(){return{parse:{transform:function(a){return j2(a)}}}},hooks:function(){return{parseNodeAttributes:function(a,e){var r=e.getAttribute("data-fa-transform");return r&&(a.transform=j2(r)),a}}},provides:function(l){l.generateAbstractTransformGrouping=function(a){var e=a.main,r=a.transform,i=a.containerWidth,s=a.iconWidth,f={transform:"translate(".concat(i/2," 256)")},n="translate(".concat(r.x*32,", ").concat(r.y*32,") "),t="scale(".concat(r.size/16*(r.flipX?-1:1),", ").concat(r.size/16*(r.flipY?-1:1),") "),m="rotate(".concat(r.rotate," 0 0)"),z={transform:"".concat(n," ").concat(t," ").concat(m)},d={transform:"translate(".concat(s/2*-1," -256)")},u={outer:f,inner:z,path:d};return{tag:"g",attributes:o({},u.outer),children:[{tag:"g",attributes:o({},u.inner),children:[{tag:e.icon.tag,children:e.icon.children,attributes:o(o({},e.icon.attributes),u.path)}]}]}}}},S1={x:0,y:0,width:"100%",height:"100%"};function V2(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return c.attributes&&(c.attributes.fill||l)&&(c.attributes.fill="black"),c}function o5(c){return c.tag==="g"?c.children:[c]}var t5={hooks:function(){return{parseNodeAttributes:function(a,e){var r=e.getAttribute("data-fa-mask"),i=r?m1(r.split(" ").map(function(s){return s.trim()})):U3();return i.prefix||(i.prefix=H()),a.mask=i,a.maskId=e.getAttribute("data-fa-mask-id"),a}}},provides:function(l){l.generateAbstractMask=function(a){var e=a.children,r=a.attributes,i=a.main,s=a.mask,f=a.maskId,n=a.transform,t=i.width,m=i.icon,z=s.width,d=s.icon,u=c6({transform:n,containerWidth:z,iconWidth:t}),C={tag:"rect",attributes:o(o({},S1),{},{fill:"white"})},v=m.children?{children:m.children.map(V2)}:{},x={tag:"g",attributes:o({},u.inner),children:[V2(o({tag:m.tag,attributes:o(o({},m.attributes),u.path)},v))]},h={tag:"g",attributes:o({},u.outer),children:[x]},N="mask-".concat(f||S2()),y="clip-".concat(f||S2()),G={tag:"mask",attributes:o(o({},S1),{},{id:N,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[C,h]},P={tag:"defs",children:[{tag:"clipPath",attributes:{id:y},children:o5(d)},G]};return e.push(P,{tag:"rect",attributes:o({fill:"currentColor","clip-path":"url(#".concat(y,")"),mask:"url(#".concat(N,")")},S1)}),{children:e,attributes:r}}}},z5={provides:function(l){var a=!1;R.matchMedia&&(a=R.matchMedia("(prefers-reduced-motion: reduce)").matches),l.missingIconAbstract=function(){var e=[],r={fill:"currentColor"},i={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};e.push({tag:"path",attributes:o(o({},r),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});var s=o(o({},i),{},{attributeName:"opacity"}),f={tag:"circle",attributes:o(o({},r),{},{cx:"256",cy:"364",r:"28"}),children:[]};return a||f.children.push({tag:"animate",attributes:o(o({},i),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:o(o({},s),{},{values:"1;0;1;1;0;1;"})}),e.push(f),e.push({tag:"path",attributes:o(o({},r),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:a?[]:[{tag:"animate",attributes:o(o({},s),{},{values:"1;0;0;0;0;1;"})}]}),a||e.push({tag:"path",attributes:o(o({},r),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:o(o({},s),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:e}}}},m5={hooks:function(){return{parseNodeAttributes:function(a,e){var r=e.getAttribute("data-fa-symbol"),i=r===null?!1:r===""?!0:r;return a.symbol=i,a}}}},M5=[e6,X6,Y6,K6,J6,s5,f5,n5,t5,z5,m5];h6(M5,{mixoutsTo:S});var q5=S.noAuto,$3=S.config,E5=S.library,X3=S.dom,Y3=S.parse,U5=S.findIconDefinition,I5=S.toHtml,K3=S.icon,W5=S.layer,p5=S.text,u5=S.counter;var d5=["*"],L5=(()=>{class c{defaultPrefix="fas";fallbackIcon=null;fixedWidth;set autoAddCss(a){$3.autoAddCss=a,this._autoAddCss=a}get autoAddCss(){return this._autoAddCss}_autoAddCss=!0;static \u0275fac=function(e){return new(e||c)};static \u0275prov=d1({token:c,factory:c.\u0275fac,providedIn:"root"})}return c})(),v5=(()=>{class c{definitions={};addIcons(...a){for(let e of a){e.prefix in this.definitions||(this.definitions[e.prefix]={}),this.definitions[e.prefix][e.iconName]=e;for(let r of e.icon[2])typeof r=="string"&&(this.definitions[e.prefix][r]=e)}}addIconPacks(...a){for(let e of a){let r=Object.keys(e).map(i=>e[i]);this.addIcons(...r)}}getIconDefinition(a,e){return a in this.definitions&&e in this.definitions[a]?this.definitions[a][e]:null}static \u0275fac=function(e){return new(e||c)};static \u0275prov=d1({token:c,factory:c.\u0275fac,providedIn:"root"})}return c})(),C5=c=>{throw new Error(`Could not find icon with iconName=${c.iconName} and prefix=${c.prefix} in the icon library.`)},h5=()=>{throw new Error("Property `icon` is required for `fa-icon`/`fa-duotone-icon` components.")},Q3=c=>c!=null&&(c===90||c===180||c===270||c==="90"||c==="180"||c==="270"),g5=c=>{let l=Q3(c.rotate),a={[`fa-${c.animation}`]:c.animation!=null&&!c.animation.startsWith("spin"),"fa-spin":c.animation==="spin"||c.animation==="spin-reverse","fa-spin-pulse":c.animation==="spin-pulse"||c.animation==="spin-pulse-reverse","fa-spin-reverse":c.animation==="spin-reverse"||c.animation==="spin-pulse-reverse","fa-pulse":c.animation==="spin-pulse"||c.animation==="spin-pulse-reverse","fa-fw":c.fixedWidth,"fa-border":c.border,"fa-inverse":c.inverse,"fa-layers-counter":c.counter,"fa-flip-horizontal":c.flip==="horizontal"||c.flip==="both","fa-flip-vertical":c.flip==="vertical"||c.flip==="both",[`fa-${c.size}`]:c.size!==null,[`fa-rotate-${c.rotate}`]:l,"fa-rotate-by":c.rotate!=null&&!l,[`fa-pull-${c.pull}`]:c.pull!==null,[`fa-stack-${c.stackItemSize}`]:c.stackItemSize!=null};return Object.keys(a).map(e=>a[e]?e:null).filter(e=>e!=null)},Z1=new WeakSet,J3="fa-auto-css";function x5(c,l){if(!l.autoAddCss||Z1.has(c))return;if(c.getElementById(J3)!=null){l.autoAddCss=!1,Z1.add(c);return}let a=c.createElement("style");a.setAttribute("type","text/css"),a.setAttribute("id",J3),a.innerHTML=X3.css();let e=c.head.childNodes,r=null;for(let i=e.length-1;i>-1;i--){let s=e[i],f=s.nodeName.toUpperCase();["STYLE","LINK"].indexOf(f)>-1&&(r=s)}c.head.insertBefore(a,r),l.autoAddCss=!1,Z1.add(c)}var b5=c=>c.prefix!==void 0&&c.iconName!==void 0,N5=(c,l)=>b5(c)?c:Array.isArray(c)&&c.length===2?{prefix:c[0],iconName:c[1]}:{prefix:l,iconName:c},S5=(()=>{class c{stackItemSize=c1("1x");size=c1();_effect=r2(()=>{if(this.size())throw new Error('fa-icon is not allowed to customize size when used inside fa-stack. Set size on the enclosing fa-stack instead: <fa-stack size="4x">...</fa-stack>.')});static \u0275fac=function(e){return new(e||c)};static \u0275dir=f2({type:c,selectors:[["fa-icon","stackItemSize",""],["fa-duotone-icon","stackItemSize",""]],inputs:{stackItemSize:[1,"stackItemSize"],size:[1,"size"]}})}return c})(),y5=(()=>{class c{size=c1();classes=v1(()=>{let a=this.size(),e=a?{[`fa-${a}`]:!0}:{};return a2(c2({},e),{"fa-stack":!0})});static \u0275fac=function(e){return new(e||c)};static \u0275cmp=L1({type:c,selectors:[["fa-stack"]],hostVars:2,hostBindings:function(e,r){e&2&&m2(r.classes())},inputs:{size:[1,"size"]},ngContentSelectors:d5,decls:1,vars:0,template:function(e,r){e&1&&(t2(),z2(0))},encapsulation:2,changeDetection:0})}return c})(),c8=(()=>{class c{icon=b();title=b();animation=b();mask=b();flip=b();size=b();pull=b();border=b();inverse=b();symbol=b();rotate=b();fixedWidth=b();transform=b();a11yRole=b();renderedIconHTML=v1(()=>{let a=this.icon()??this.config.fallbackIcon;if(!a)return h5(),"";let e=this.findIconDefinition(a);if(!e)return"";let r=this.buildParams();x5(this.document,this.config);let i=K3(e,r);return this.sanitizer.bypassSecurityTrustHtml(i.html.join(`
`))});document=E(e2);sanitizer=E(M2);config=E(L5);iconLibrary=E(v5);stackItem=E(S5,{optional:!0});stack=E(y5,{optional:!0});constructor(){this.stack!=null&&this.stackItem==null&&console.error('FontAwesome: fa-icon and fa-duotone-icon elements must specify stackItemSize attribute when wrapped into fa-stack. Example: <fa-icon stackItemSize="2x" />.')}findIconDefinition(a){let e=N5(a,this.config.defaultPrefix);if("icon"in e)return e;let r=this.iconLibrary.getIconDefinition(e.prefix,e.iconName);return r??(C5(e),null)}buildParams(){let a=this.fixedWidth(),e={flip:this.flip(),animation:this.animation(),border:this.border(),inverse:this.inverse(),size:this.size(),pull:this.pull(),rotate:this.rotate(),fixedWidth:typeof a=="boolean"?a:this.config.fixedWidth,stackItemSize:this.stackItem!=null?this.stackItem.stackItemSize():void 0},r=this.transform(),i=typeof r=="string"?Y3.transform(r):r,s=this.mask(),f=s!=null?this.findIconDefinition(s):null,n={},t=this.a11yRole();t!=null&&(n.role=t);let m={};return e.rotate!=null&&!Q3(e.rotate)&&(m["--fa-rotate-angle"]=`${e.rotate}`),{title:this.title(),transform:i,classes:g5(e),mask:f??void 0,symbol:this.symbol(),attributes:n,styles:m}}static \u0275fac=function(e){return new(e||c)};static \u0275cmp=L1({type:c,selectors:[["fa-icon"]],hostAttrs:[1,"ng-fa-icon"],hostVars:2,hostBindings:function(e,r){e&2&&(o2("innerHTML",r.renderedIconHTML(),i2),n2("title",r.title()??void 0))},inputs:{icon:[1,"icon"],title:[1,"title"],animation:[1,"animation"],mask:[1,"mask"],flip:[1,"flip"],size:[1,"size"],pull:[1,"pull"],border:[1,"border"],inverse:[1,"inverse"],symbol:[1,"symbol"],rotate:[1,"rotate"],fixedWidth:[1,"fixedWidth"],transform:[1,"transform"],a11yRole:[1,"a11yRole"]},outputs:{icon:"iconChange",title:"titleChange",animation:"animationChange",mask:"maskChange",flip:"flipChange",size:"sizeChange",pull:"pullChange",border:"borderChange",inverse:"inverseChange",symbol:"symbolChange",rotate:"rotateChange",fixedWidth:"fixedWidthChange",transform:"transformChange",a11yRole:"a11yRoleChange"},decls:0,vars:0,template:function(e,r){},encapsulation:2,changeDetection:0})}return c})();var a8=(()=>{class c{static \u0275fac=function(e){return new(e||c)};static \u0275mod=s2({type:c});static \u0275inj=l2({})}return c})();var r8={prefix:"fas",iconName:"kitchen-set",icon:[576,512,[],"e51a","M240 144a96 96 0 1 0 -192 0 96 96 0 1 0 192 0zm44.4 32C269.9 240.1 212.5 288 144 288 64.5 288 0 223.5 0 144S64.5 0 144 0c68.5 0 125.9 47.9 140.4 112l71.8 0c8.8-9.8 21.6-16 35.8-16l104 0c26.5 0 48 21.5 48 48s-21.5 48-48 48l-104 0c-14.2 0-27-6.2-35.8-16l-71.8 0zM144 80a64 64 0 1 1 0 128 64 64 0 1 1 0-128zM400 240c13.3 0 24 10.7 24 24l0 8 96 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-240 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l96 0 0-8c0-13.3 10.7-24 24-24zM288 464l0-112 224 0 0 112c0 26.5-21.5 48-48 48l-128 0c-26.5 0-48-21.5-48-48zM48 320l128 0c26.5 0 48 21.5 48 48s-21.5 48-48 48l-16 0c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-80c0-8.8 7.2-16 16-16zm128 64c8.8 0 16-7.2 16-16s-7.2-16-16-16l-16 0 0 32 16 0zM24 464l176 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 512c-13.3 0-24-10.7-24-24s10.7-24 24-24z"]};var i8={prefix:"fas",iconName:"bell",icon:[448,512,[128276,61602],"f0f3","M224 0c-17.7 0-32 14.3-32 32l0 3.2C119 50 64 114.6 64 192l0 21.7c0 48.1-16.4 94.8-46.4 132.4L7.8 358.3C2.7 364.6 0 372.4 0 380.5 0 400.1 15.9 416 35.5 416l376.9 0c19.6 0 35.5-15.9 35.5-35.5 0-8.1-2.7-15.9-7.8-22.2l-9.8-12.2C400.4 308.5 384 261.8 384 213.7l0-21.7c0-77.4-55-142-128-156.8l0-3.2c0-17.7-14.3-32-32-32zM162 464c7.1 27.6 32.2 48 62 48s54.9-20.4 62-48l-124 0z"]};var s8={prefix:"fas",iconName:"magnifying-glass",icon:[512,512,[128269,"search"],"f002","M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"]};var f8={prefix:"fas",iconName:"bowl-food",icon:[512,512,[],"e4c6","M0 176c0-35.3 28.7-64 64-64 .5 0 1.1 0 1.6 0 7.4-36.5 39.7-64 78.4-64 15 0 29 4.1 40.9 11.2 13.3-25.7 40.1-43.2 71.1-43.2s57.8 17.6 71.1 43.2c12-7.1 26-11.2 40.9-11.2 38.7 0 71 27.5 78.4 64 .5 0 1.1 0 1.6 0 35.3 0 64 28.7 64 64 0 11.7-3.1 22.6-8.6 32L8.6 208C3.1 198.6 0 187.7 0 176zM0 283.4C0 268.3 12.3 256 27.4 256l457.1 0c15.1 0 27.4 12.3 27.4 27.4 0 70.5-44.4 130.7-106.7 154.1L403.5 452c-2 16-15.6 28-31.8 28l-231.5 0c-16.1 0-29.8-12-31.8-28l-1.8-14.4C44.4 414.1 0 353.9 0 283.4z"]};var n8={prefix:"fas",iconName:"clock",icon:[512,512,[128339,"clock-four"],"f017","M256 0a256 256 0 1 1 0 512 256 256 0 1 1 0-512zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"]};var o8={prefix:"fas",iconName:"book",icon:[448,512,[128212],"f02d","M384 512L96 512c-53 0-96-43-96-96L0 96C0 43 43 0 96 0L400 0c26.5 0 48 21.5 48 48l0 288c0 20.9-13.4 38.7-32 45.3l0 66.7c17.7 0 32 14.3 32 32s-14.3 32-32 32l-32 0zM96 384c-17.7 0-32 14.3-32 32s14.3 32 32 32l256 0 0-64-256 0zm32-232c0 13.3 10.7 24 24 24l176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-176 0c-13.3 0-24 10.7-24 24zm24 72c-13.3 0-24 10.7-24 24s10.7 24 24 24l176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-176 0z"]};var t8={prefix:"fas",iconName:"rocket",icon:[512,512,[],"f135","M128 320L24.5 320c-24.9 0-40.2-27.1-27.4-48.5L50 183.3C58.7 168.8 74.3 160 91.2 160l95 0c76.1-128.9 189.6-135.4 265.5-124.3 12.8 1.9 22.8 11.9 24.6 24.6 11.1 75.9 4.6 189.4-124.3 265.5l0 95c0 16.9-8.8 32.5-23.3 41.2l-88.2 52.9c-21.3 12.8-48.5-2.6-48.5-27.4L192 384c0-35.3-28.7-64-64-64l-.1 0zM400 160a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z"]};var z8={prefix:"fas",iconName:"heart",icon:[512,512,[128153,128154,128155,128156,128420,129293,129294,129505,9829,10084,61578],"f004","M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z"]};var m8={prefix:"fas",iconName:"chevron-right",icon:[320,512,[9002],"f054","M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"]};var M8={prefix:"fas",iconName:"seedling",icon:[512,512,[127793,"sprout"],"f4d8","M512 32C512 140.1 435.4 230.3 333.6 251.4 325.7 193.3 299.6 141 261.1 100.5 301.2 40 369.9 0 448 0l32 0c17.7 0 32 14.3 32 32zM0 96C0 78.3 14.3 64 32 64l32 0c123.7 0 224 100.3 224 224l0 192c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-160C100.3 320 0 219.7 0 96z"]};var p8={prefix:"fas",iconName:"fire",icon:[448,512,[128293],"f06d","M160.5-26.4c9.3-7.8 23-7.5 31.9 .9 12.3 11.6 23.3 24.4 33.9 37.4 13.5 16.5 29.7 38.3 45.3 64.2 5.2-6.8 10-12.8 14.2-17.9 1.1-1.3 2.2-2.7 3.3-4.1 7.9-9.8 17.7-22.1 30.8-22.1 13.4 0 22.8 11.9 30.8 22.1 1.3 1.7 2.6 3.3 3.9 4.8 10.3 12.4 24 30.3 37.7 52.4 27.2 43.9 55.6 106.4 55.6 176.6 0 123.7-100.3 224-224 224S0 411.7 0 288c0-91.1 41.1-170 80.5-225 19.9-27.7 39.7-49.9 54.6-65.1 8.2-8.4 16.5-16.7 25.5-24.2zM225.7 416c25.3 0 47.7-7 68.8-21 42.1-29.4 53.4-88.2 28.1-134.4-4.5-9-16-9.6-22.5-2l-25.2 29.3c-6.6 7.6-18.5 7.4-24.7-.5-17.3-22.1-49.1-62.4-65.3-83-5.4-6.9-15.2-8-21.5-1.9-18.3 17.8-51.5 56.8-51.5 104.3 0 68.6 50.6 109.2 113.7 109.2z"]};var u8={prefix:"fas",iconName:"flask",icon:[448,512,[],"f0c3","M288 0L128 0C110.3 0 96 14.3 96 32s14.3 32 32 32L128 215.5 7.5 426.3C2.6 435 0 444.7 0 454.7 0 486.4 25.6 512 57.3 512l333.4 0c31.6 0 57.3-25.6 57.3-57.3 0-10-2.6-19.8-7.5-28.4L320 215.5 320 64c17.7 0 32-14.3 32-32S337.7 0 320 0L288 0zM192 215.5l0-151.5 64 0 0 151.5c0 11.1 2.9 22.1 8.4 31.8l41.6 72.7-164 0 41.6-72.7c5.5-9.7 8.4-20.6 8.4-31.8z"]};var d8={prefix:"fas",iconName:"utensils",icon:[512,512,[127860,61685,"cutlery"],"f2e7","M63.9 14.4C63.1 6.2 56.2 0 48 0s-15.1 6.2-16 14.3L17.9 149.7c-1.3 6-1.9 12.1-1.9 18.2 0 45.9 35.1 83.6 80 87.7L96 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224.4c44.9-4.1 80-41.8 80-87.7 0-6.1-.6-12.2-1.9-18.2L223.9 14.3C223.1 6.2 216.2 0 208 0s-15.1 6.2-15.9 14.4L178.5 149.9c-.6 5.7-5.4 10.1-11.1 10.1-5.8 0-10.6-4.4-11.2-10.2L143.9 14.6C143.2 6.3 136.3 0 128 0s-15.2 6.3-15.9 14.6L99.8 149.8c-.5 5.8-5.4 10.2-11.2 10.2-5.8 0-10.6-4.4-11.1-10.1L63.9 14.4zM448 0C432 0 320 32 320 176l0 112c0 35.3 28.7 64 64 64l32 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-448c0-17.7-14.3-32-32-32z"]};var L8={prefix:"fas",iconName:"circle-xmark",icon:[512,512,[61532,"times-circle","xmark-circle"],"f057","M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c9.4-9.4 24.6-9.4 33.9 0l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9z"]};var v8={prefix:"fas",iconName:"box-open",icon:[640,512,[],"f49e","M560.3 237.2c10.4 11.8 28.3 14.4 41.8 5.5 14.7-9.8 18.7-29.7 8.9-44.4l-48-72c-2.8-4.2-6.6-7.7-11.1-10.2L351.4 4.7c-19.3-10.7-42.8-10.7-62.2 0L88.8 116c-5.4 3-9.7 7.4-12.6 12.8L27.7 218.7c-12.6 23.4-3.8 52.5 19.6 65.1l33 17.7 0 53.3c0 23 12.4 44.3 32.4 55.7l176 99.7c19.6 11.1 43.5 11.1 63.1 0l176-99.7c20.1-11.4 32.4-32.6 32.4-55.7l0-117.5zm-240-9.8L170.2 144 320.3 60.6 470.4 144 320.3 227.4zm-41.5 50.2l-21.3 46.2-165.8-88.8 25.4-47.2 161.7 89.8z"]};var C8={prefix:"fas",iconName:"sun",icon:[576,512,[9728],"f185","M178.2-10.1c7.4-3.1 15.8-2.2 22.5 2.2l87.8 58.2 87.8-58.2c6.7-4.4 15.1-5.2 22.5-2.2S411.4-.5 413 7.3l20.9 103.2 103.2 20.9c7.8 1.6 14.4 7 17.4 14.3s2.2 15.8-2.2 22.5l-58.2 87.8 58.2 87.8c4.4 6.7 5.2 15.1 2.2 22.5s-9.6 12.8-17.4 14.3L433.8 401.4 413 504.7c-1.6 7.8-7 14.4-14.3 17.4s-15.8 2.2-22.5-2.2l-87.8-58.2-87.8 58.2c-6.7 4.4-15.1 5.2-22.5 2.2s-12.8-9.6-14.3-17.4L143 401.4 39.7 380.5c-7.8-1.6-14.4-7-17.4-14.3s-2.2-15.8 2.2-22.5L82.7 256 24.5 168.2c-4.4-6.7-5.2-15.1-2.2-22.5s9.6-12.8 17.4-14.3L143 110.6 163.9 7.3c1.6-7.8 7-14.4 14.3-17.4zM207.6 256a80.4 80.4 0 1 1 160.8 0 80.4 80.4 0 1 1 -160.8 0zm208.8 0a128.4 128.4 0 1 0 -256.8 0 128.4 128.4 0 1 0 256.8 0z"]};var h8={prefix:"fas",iconName:"wheat-awn",icon:[576,512,["wheat-alt"],"e2cd","M79.7 234.6c6.2-4.1 14.7-3.4 20.1 2.1l46.1 46.1 6.1 6.7c19.7 23.8 26.3 55 19.2 83.9 31.7-7.7 66.2 1 90.6 25.3l46.1 46.1c6.2 6.2 6.2 16.4 0 22.6l-7.4 7.4c-37.5 37.5-98.3 37.5-135.8 0L134.1 444.3 49.4 529c-9.4 9.4-24.5 9.4-33.9 0-9.4-9.4-9.4-24.6 0-33.9l84.7-84.7-30.5-30.5c-37.5-37.5-37.5-98.3 0-135.7l7.4-7.4 2.5-2.1zm104-104c6.2-4.1 14.7-3.4 20.1 2.1l46.1 46.1 6.1 6.7c19.7 23.8 26.3 55 19.2 83.9 31.7-7.7 66.2 1 90.6 25.3l46.1 46.1c6.2 6.2 6.2 16.4 0 22.6l-7.4 7.4c-37.5 37.5-98.3 37.5-135.8 0l-94.9-94.9c-37.5-37.5-37.5-98.3 0-135.7l7.4-7.4 2.5-2.1zM495.2 15c9.4-9.4 24.6-9.4 34 0 8.8 8.8 9.3 22.7 1.6 32.2L529.2 49 414.7 163.4c7.7 1 15.2 3 22.5 5.9L495.5 111c9.4-9.4 24.6-9.4 34 0 8.8 8.8 9.3 22.7 1.6 32.1l-1.7 1.8-52.7 52.7 39 39c6.2 6.2 6.2 16.4 0 22.6l-7.4 7.4c-37.5 37.5-98.3 37.5-135.8 0l-94.9-94.9c-37.5-37.5-37.5-98.3 0-135.7l7.4-7.4 2.5-2.1c6.2-4.1 14.7-3.4 20.1 2.1l39 39 52.7-52.7c9.4-9.4 24.6-9.4 34 0 8.8 8.8 9.3 22.7 1.6 32.1l-1.7 1.8-58.3 58.3c2.8 7.1 4.7 14.5 5.7 22.1L495.2 15z"]};var g8={prefix:"fas",iconName:"lightbulb",icon:[384,512,[128161],"f0eb","M292.9 384c7.3-22.3 21.9-42.5 38.4-59.9 32.7-34.4 52.7-80.9 52.7-132.1 0-106-86-192-192-192S0 86 0 192c0 51.2 20 97.7 52.7 132.1 16.5 17.4 31.2 37.6 38.4 59.9l201.7 0zM288 432l-192 0 0 16c0 44.2 35.8 80 80 80l32 0c44.2 0 80-35.8 80-80l0-16zM184 112c-39.8 0-72 32.2-72 72 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-66.3 53.7-120 120-120 13.3 0 24 10.7 24 24s-10.7 24-24 24z"]};var x8={prefix:"fas",iconName:"code",icon:[576,512,[],"f121","M360.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm64.6 136.1c-12.5 12.5-12.5 32.8 0 45.3l73.4 73.4-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0zm-274.7 0c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 150.6 182.6c12.5-12.5 12.5-32.8 0-45.3z"]};var b8={prefix:"fas",iconName:"diagram-project",icon:[512,512,["project-diagram"],"f542","M0 80C0 53.5 21.5 32 48 32l96 0c26.5 0 48 21.5 48 48l0 16 128 0 0-16c0-26.5 21.5-48 48-48l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48l0-16-128 0 0 16c0 7.3-1.7 14.3-4.6 20.5l68.6 91.5 80 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48l0-96c0-7.3 1.7-14.3 4.6-20.5L128 224 48 224c-26.5 0-48-21.5-48-48L0 80z"]};var N8={prefix:"fas",iconName:"terminal",icon:[512,512,[],"f120","M9.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L146.7 256 9.4 118.6zM224 384l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"]};var S8={prefix:"fas",iconName:"hotdog",icon:[512,512,[127789],"f80f","M288 0c-20.5 0-40.1 8.1-54.6 22.6L22.6 233.4C8.1 247.9 0 267.5 0 288 0 300.2 2.9 312.1 8.2 322.7L322.7 8.2C312.1 2.9 300.2 0 288 0zM224 512c20.5 0 40.1-8.1 54.6-22.6L489.4 278.6c14.5-14.5 22.6-34.1 22.6-54.6 0-12.2-2.9-24.1-8.2-34.7L189.3 503.8c10.7 5.4 22.6 8.2 34.7 8.2zM456.6 168.6c31.2-31.2 31.2-81.9 0-113.1s-81.9-31.2-113.1 0l-288 288c-31.2 31.2-31.2 81.9 0 113.1s81.9 31.2 113.1 0l288-288z"]};var y8={prefix:"fas",iconName:"link",icon:[576,512,[128279,"chain"],"f0c1","M419.5 96c-16.6 0-32.7 4.5-46.8 12.7-15.8-16-34.2-29.4-54.5-39.5 28.2-24 64.1-37.2 101.3-37.2 86.4 0 156.5 70 156.5 156.5 0 41.5-16.5 81.3-45.8 110.6l-71.1 71.1c-29.3 29.3-69.1 45.8-110.6 45.8-86.4 0-156.5-70-156.5-156.5 0-1.5 0-3 .1-4.5 .5-17.7 15.2-31.6 32.9-31.1s31.6 15.2 31.1 32.9c0 .9 0 1.8 0 2.6 0 51.1 41.4 92.5 92.5 92.5 24.5 0 48-9.7 65.4-27.1l71.1-71.1c17.3-17.3 27.1-40.9 27.1-65.4 0-51.1-41.4-92.5-92.5-92.5zM275.2 173.3c-1.9-.8-3.8-1.9-5.5-3.1-12.6-6.5-27-10.2-42.1-10.2-24.5 0-48 9.7-65.4 27.1L91.1 258.2c-17.3 17.3-27.1 40.9-27.1 65.4 0 51.1 41.4 92.5 92.5 92.5 16.5 0 32.6-4.4 46.7-12.6 15.8 16 34.2 29.4 54.6 39.5-28.2 23.9-64 37.2-101.3 37.2-86.4 0-156.5-70-156.5-156.5 0-41.5 16.5-81.3 45.8-110.6l71.1-71.1c29.3-29.3 69.1-45.8 110.6-45.8 86.6 0 156.5 70.6 156.5 156.9 0 1.3 0 2.6 0 3.9-.4 17.7-15.1 31.6-32.8 31.2s-31.6-15.1-31.2-32.8c0-.8 0-1.5 0-2.3 0-33.7-18-63.3-44.8-79.6z"]};var k5={prefix:"fas",iconName:"gear",icon:[512,512,[9881,"cog"],"f013","M195.1 9.5C198.1-5.3 211.2-16 226.4-16l59.8 0c15.2 0 28.3 10.7 31.3 25.5L332 79.5c14.1 6 27.3 13.7 39.3 22.8l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.2 4.9 29.8-6.5 39.9L447 233.3c.9 7.4 1.3 15 1.3 22.7s-.5 15.3-1.3 22.7l53.4 47.5c11.4 10.1 14 26.8 6.5 39.9l-29.9 51.8c-7.6 13.1-23.4 19.2-37.8 14.4l-67.8-22.5c-12.1 9.1-25.3 16.7-39.3 22.8l-14.4 69.9c-3.1 14.9-16.2 25.5-31.3 25.5l-59.8 0c-15.2 0-28.3-10.7-31.3-25.5l-14.4-69.9c-14.1-6-27.2-13.7-39.3-22.8L73.5 432.3c-14.4 4.8-30.2-1.2-37.8-14.4L5.8 366.1c-7.6-13.2-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.3 1.3-22.7L12.3 185.8c-11.4-10.1-14-26.8-6.5-39.9L35.7 94.1c7.6-13.2 23.4-19.2 37.8-14.4l67.8 22.5c12.1-9.1 25.3-16.7 39.3-22.8L195.1 9.5zM256.3 336a80 80 0 1 0 -.6-160 80 80 0 1 0 .6 160z"]},k8=k5;var w8={prefix:"fas",iconName:"cubes-stacked",icon:[512,512,[],"e4e6","M192 32c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-64zm32 352l64 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32zm192 0l64 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32zM320 192l64 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32zm-182.6-3.9c12.5-12.5 32.8-12.5 45.3 0l45.3 45.3c12.5 12.5 12.5 32.8 0 45.3l-45.3 45.3c-12.5 12.5-32.8 12.5-45.3 0L92.1 278.6c-12.5-12.5-12.5-32.8 0-45.3l45.3-45.3zM32 384l64 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32z"]};var A8={prefix:"fas",iconName:"play",icon:[448,512,[9654],"f04b","M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z"]};var P8={prefix:"fas",iconName:"puzzle-piece",icon:[512,512,[129513],"f12e","M224 0c35.3 0 64 21.5 64 48 0 10.4-4.4 20-12 27.9-6.6 6.9-12 15.3-12 24.9 0 15 12.2 27.2 27.2 27.2l44.8 0c26.5 0 48 21.5 48 48l0 44.8c0 15 12.2 27.2 27.2 27.2 9.5 0 18-5.4 24.9-12 7.9-7.5 17.5-12 27.9-12 26.5 0 48 28.7 48 64s-21.5 64-48 64c-10.4 0-20.1-4.4-27.9-12-6.9-6.6-15.3-12-24.9-12-15 0-27.2 12.2-27.2 27.2L384 464c0 26.5-21.5 48-48 48l-56.8 0c-12.8 0-23.2-10.4-23.2-23.2 0-9.2 5.8-17.3 13.2-22.8 11.6-8.7 18.8-20.7 18.8-34 0-26.5-28.7-48-64-48s-64 21.5-64 48c0 13.3 7.2 25.3 18.8 34 7.4 5.5 13.2 13.5 13.2 22.8 0 12.8-10.4 23.2-23.2 23.2L48 512c-26.5 0-48-21.5-48-48L0 343.2c0-12.8 10.4-23.2 23.2-23.2 9.2 0 17.3 5.8 22.8 13.2 8.7 11.6 20.7 18.8 34 18.8 26.5 0 48-28.7 48-64s-21.5-64-48-64c-13.3 0-25.3 7.2-34 18.8-5.5 7.4-13.5 13.2-22.8 13.2-12.8 0-23.2-10.4-23.2-23.2L0 176c0-26.5 21.5-48 48-48l108.8 0c15 0 27.2-12.2 27.2-27.2 0-9.5-5.4-18-12-24.9-7.5-7.9-12-17.5-12-27.9 0-26.5 28.7-48 64-48z"]};var F8={prefix:"fas",iconName:"gem",icon:[512,512,[128142],"f3a5","M116.7 33.8c4.5-6.1 11.7-9.8 19.3-9.8l240 0c7.6 0 14.8 3.6 19.3 9.8l112 152c6.8 9.2 6.1 21.9-1.5 30.4l-232 256c-4.5 5-11 7.9-17.8 7.9s-13.2-2.9-17.8-7.9l-232-256c-7.7-8.5-8.3-21.2-1.5-30.4l112-152zm38.5 39.8c-3.3 2.5-4.2 7-2.1 10.5L210.5 179.8 63.3 192c-4.1 .3-7.3 3.8-7.3 8s3.2 7.6 7.3 8l192 16c.4 0 .9 0 1.3 0l192-16c4.1-.3 7.3-3.8 7.3-8s-3.2-7.6-7.3-8l-147.2-12.3 57.4-95.6c2.1-3.5 1.2-8.1-2.1-10.5s-7.9-2-10.7 1L256 172.2 165.9 74.6c-2.8-3-7.4-3.4-10.7-1z"]};var T8={prefix:"fas",iconName:"check",icon:[448,512,[10003,10004],"f00c","M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"]};var D8={prefix:"fas",iconName:"house",icon:[512,512,[127968,63498,63500,"home","home-alt","home-lg-alt"],"f015","M277.8 8.6c-12.3-11.4-31.3-11.4-43.5 0l-224 208c-9.6 9-12.8 22.9-8 35.1S18.8 272 32 272l16 0 0 176c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-176 16 0c13.2 0 25-8.1 29.8-20.3s1.6-26.2-8-35.1l-224-208zM240 320l32 0c26.5 0 48 21.5 48 48l0 96-128 0 0-96c0-26.5 21.5-48 48-48z"]};var B8={prefix:"fas",iconName:"server",icon:[448,512,[],"f233","M64 32C28.7 32 0 60.7 0 96l0 64c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-64c0-35.3-28.7-64-64-64L64 32zm216 72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm56 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM64 288c-35.3 0-64 28.7-64 64l0 64c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-64c0-35.3-28.7-64-64-64L64 288zm216 72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm56 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"]};var R8={prefix:"fas",iconName:"arrow-right",icon:[512,512,[8594],"f061","M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"]};var H8={prefix:"fas",iconName:"xmark",icon:[384,512,[128473,10005,10006,10060,215,"close","multiply","remove","times"],"f00d","M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"]};var q8={prefix:"fas",iconName:"circle-check",icon:[512,512,[61533,"check-circle"],"f058","M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zM374 145.7c-10.7-7.8-25.7-5.4-33.5 5.3L221.1 315.2 169 263.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.8 7.5 18.8 7s13.4-4.1 17.5-9.8L379.3 179.2c7.8-10.7 5.4-25.7-5.3-33.5z"]};var E8={prefix:"fas",iconName:"moon",icon:[512,512,[127769,9214],"f186","M256 0C114.6 0 0 114.6 0 256S114.6 512 256 512c68.8 0 131.3-27.2 177.3-71.4 7.3-7 9.4-17.9 5.3-27.1s-13.7-14.9-23.8-14.1c-4.9 .4-9.8 .6-14.8 .6-101.6 0-184-82.4-184-184 0-72.1 41.5-134.6 102.1-164.8 9.1-4.5 14.3-14.3 13.1-24.4S322.6 8.5 312.7 6.3C294.4 2.2 275.4 0 256 0z"]};var U8={prefix:"fas",iconName:"list",icon:[512,512,["list-squares"],"f03a","M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z"]};var I8={prefix:"fas",iconName:"plug",icon:[448,512,[128268],"f1e6","M128-32c17.7 0 32 14.3 32 32l0 96 128 0 0-96c0-17.7 14.3-32 32-32s32 14.3 32 32l0 96 64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l0 64c0 95.1-69.2 174.1-160 189.3l0 66.7c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-66.7C101.2 398.1 32 319.1 32 224l0-64c-17.7 0-32-14.3-32-32S14.3 96 32 96l64 0 0-96c0-17.7 14.3-32 32-32z"]};var W8={prefix:"fas",iconName:"wand-magic-sparkles",icon:[576,512,["magic-wand-sparkles"],"e2ca","M263.4-27L278.2 9.8 315 24.6c3 1.2 5 4.2 5 7.4s-2 6.2-5 7.4L278.2 54.2 263.4 91c-1.2 3-4.2 5-7.4 5s-6.2-2-7.4-5L233.8 54.2 197 39.4c-3-1.2-5-4.2-5-7.4s2-6.2 5-7.4L233.8 9.8 248.6-27c1.2-3 4.2-5 7.4-5s6.2 2 7.4 5zM110.7 41.7l21.5 50.1 50.1 21.5c5.9 2.5 9.7 8.3 9.7 14.7s-3.8 12.2-9.7 14.7l-50.1 21.5-21.5 50.1c-2.5 5.9-8.3 9.7-14.7 9.7s-12.2-3.8-14.7-9.7L59.8 164.2 9.7 142.7C3.8 140.2 0 134.4 0 128s3.8-12.2 9.7-14.7L59.8 91.8 81.3 41.7C83.8 35.8 89.6 32 96 32s12.2 3.8 14.7 9.7zM464 304c6.4 0 12.2 3.8 14.7 9.7l21.5 50.1 50.1 21.5c5.9 2.5 9.7 8.3 9.7 14.7s-3.8 12.2-9.7 14.7l-50.1 21.5-21.5 50.1c-2.5 5.9-8.3 9.7-14.7 9.7s-12.2-3.8-14.7-9.7l-21.5-50.1-50.1-21.5c-5.9-2.5-9.7-8.3-9.7-14.7s3.8-12.2 9.7-14.7l50.1-21.5 21.5-50.1c2.5-5.9 8.3-9.7 14.7-9.7zM460 0c11 0 21.6 4.4 29.5 12.2l42.3 42.3C539.6 62.4 544 73 544 84s-4.4 21.6-12.2 29.5l-88.2 88.2-101.3-101.3 88.2-88.2C438.4 4.4 449 0 460 0zM44.2 398.5L308.4 134.3 409.7 235.6 145.5 499.8C137.6 507.6 127 512 116 512s-21.6-4.4-29.5-12.2L44.2 457.5C36.4 449.6 32 439 32 428s4.4-21.6 12.2-29.5z"]};var G8={prefix:"fas",iconName:"star",icon:[576,512,[11088,61446],"f005","M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"]};var w5={prefix:"fas",iconName:"triangle-exclamation",icon:[512,512,[9888,"exclamation-triangle","warning"],"f071","M256 0c14.7 0 28.2 8.1 35.2 21l216 400c6.7 12.4 6.4 27.4-.8 39.5S486.1 480 472 480L40 480c-14.1 0-27.2-7.4-34.4-19.5s-7.5-27.1-.8-39.5l216-400c7-12.9 20.5-21 35.2-21zm0 352a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-192c-18.2 0-32.7 15.5-31.4 33.7l7.4 104c.9 12.5 11.4 22.3 23.9 22.3 12.6 0 23-9.7 23.9-22.3l7.4-104c1.3-18.2-13.1-33.7-31.4-33.7z"]},O8=w5;var j8={prefix:"fas",iconName:"download",icon:[448,512,[],"f019","M256 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 210.7-41.4-41.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 242.7 256 32zM64 320c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-46.9 0-56.6 56.6c-31.2 31.2-81.9 31.2-113.1 0L110.9 320 64 320zm304 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"]};var V8={prefix:"fas",iconName:"shield-halved",icon:[512,512,["shield-alt"],"f3ed","M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"]};var _8={prefix:"fas",iconName:"tower-broadcast",icon:[576,512,["broadcast-tower"],"f519","M87.9 11.5c-11.3-6.9-26.1-3.2-33 8.1-24.8 41-39 89.1-39 140.4s14.2 99.4 39 140.4c6.9 11.3 21.6 15 33 8.1s15-21.6 8.1-33C75.7 241.9 64 202.3 64 160S75.7 78.1 96.1 44.4c6.9-11.3 3.2-26.1-8.1-33zm400.1 0c-11.3 6.9-15 21.6-8.1 33 20.4 33.7 32.1 73.3 32.1 115.6s-11.7 81.9-32.1 115.6c-6.9 11.3-3.2 26.1 8.1 33s26.1 3.2 33-8.1c24.8-41 39-89.1 39-140.4S545.8 60.6 521 19.6c-6.9-11.3-21.6-15-33-8.1zM320 215.4c19.1-11.1 32-31.7 32-55.4 0-35.3-28.7-64-64-64s-64 28.7-64 64c0 23.7 12.9 44.4 32 55.4L256 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-264.6zM180.2 91c7.2-11.2 3.9-26-7.2-33.2s-26-3.9-33.2 7.2c-17.6 27.4-27.8 60-27.8 95s10.2 67.6 27.8 95c7.2 11.2 22 14.4 33.2 7.2s14.4-22 7.2-33.2c-12.8-19.9-20.2-43.6-20.2-69s7.4-49.1 20.2-69zM436.2 65c-7.2-11.2-22-14.4-33.2-7.2s-14.4 22-7.2 33.2c12.8 19.9 20.2 43.6 20.2 69s-7.4 49.1-20.2 69c-7.2 11.2-3.9 26 7.2 33.2s26 3.9 33.2-7.2c17.6-27.4 27.8-60 27.8-95s-10.2-67.6-27.8-95z"]};var $8={prefix:"fas",iconName:"bread-slice",icon:[512,512,[],"f7ec","M64 432l0-176c-35.3 0-64-28.7-64-64 0-216.5 512-216.5 512 0 0 35.3-28.7 64-64 64l0 176c0 26.5-21.5 48-48 48l-288 0c-26.5 0-48-21.5-48-48z"]},X8={prefix:"fas",iconName:"globe",icon:[512,512,[127760],"f0ac","M351.9 280l-190.9 0c2.9 64.5 17.2 123.9 37.5 167.4 11.4 24.5 23.7 41.8 35.1 52.4 11.2 10.5 18.9 12.2 22.9 12.2s11.7-1.7 22.9-12.2c11.4-10.6 23.7-28 35.1-52.4 20.3-43.5 34.6-102.9 37.5-167.4zM160.9 232l190.9 0C349 167.5 334.7 108.1 314.4 64.6 303 40.2 290.7 22.8 279.3 12.2 268.1 1.7 260.4 0 256.4 0s-11.7 1.7-22.9 12.2c-11.4 10.6-23.7 28-35.1 52.4-20.3 43.5-34.6 102.9-37.5 167.4zm-48 0C116.4 146.4 138.5 66.9 170.8 14.7 78.7 47.3 10.9 131.2 1.5 232l111.4 0zM1.5 280c9.4 100.8 77.2 184.7 169.3 217.3-32.3-52.2-54.4-131.7-57.9-217.3L1.5 280zm398.4 0c-3.5 85.6-25.6 165.1-57.9 217.3 92.1-32.7 159.9-116.5 169.3-217.3l-111.4 0zm111.4-48C501.9 131.2 434.1 47.3 342 14.7 374.3 66.9 396.4 146.4 399.9 232l111.4 0z"]};var Y8={prefix:"fas",iconName:"copy",icon:[448,512,[],"f0c5","M192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-200.6c0-17.4-7.1-34.1-19.7-46.2L370.6 17.8C358.7 6.4 342.8 0 326.3 0L192 0zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-16-64 0 0 16-192 0 0-256 16 0 0-64-16 0z"]};var K8={prefix:"fas",iconName:"mug-hot",icon:[576,512,[9749],"f7b6","M152-16c-13.3 0-24 10.7-24 24 0 38.9 23.4 59.4 39.1 73.1l1.1 1c16.3 14.3 23.8 21.8 23.8 37.9 0 13.3 10.7 24 24 24s24-10.7 24-24c0-38.9-23.4-59.4-39.1-73.1l-1.1-1C183.5 31.7 176 24.1 176 8 176-5.3 165.3-16 152-16zM96 192c-17.7 0-32 14.3-32 32l0 192c0 53 43 96 96 96l192 0c41.8 0 77.4-26.7 90.5-64l5.5 0c70.7 0 128-57.3 128-128S518.7 192 448 192L96 192zM448 384l0-128c35.3 0 64 28.7 64 64s-28.7 64-64 64zM288 8c0-13.3-10.7-24-24-24S240-5.3 240 8c0 38.9 23.4 59.4 39.1 73.1l1.1 1c16.3 14.3 23.8 21.8 23.8 37.9 0 13.3 10.7 24 24 24s24-10.7 24-24c0-38.9-23.4-59.4-39.1-73.1l-1.1-1C295.5 31.7 288 24.1 288 8z"]},J8={prefix:"fas",iconName:"bolt",icon:[448,512,[9889,"zap"],"f0e7","M338.8-9.9c11.9 8.6 16.3 24.2 10.9 37.8L271.3 224 416 224c13.5 0 25.5 8.4 30.1 21.1s.7 26.9-9.6 35.5l-288 240c-11.3 9.4-27.4 9.9-39.3 1.3s-16.3-24.2-10.9-37.8L176.7 288 32 288c-13.5 0-25.5-8.4-30.1-21.1s-.7-26.9 9.6-35.5l288-240c11.3-9.4 27.4-9.9 39.3-1.3z"]};var Q8={prefix:"fas",iconName:"cookie-bite",icon:[512,512,[],"f564","M257.5 27.6c-.8-5.4-4.9-9.8-10.3-10.6-22.1-3.1-44.6 .9-64.4 11.4l-74 39.5C89.1 78.4 73.2 94.9 63.4 115L26.7 190.6c-9.8 20.1-13 42.9-9.1 64.9l14.5 82.8c3.9 22.1 14.6 42.3 30.7 57.9l60.3 58.4c16.1 15.6 36.6 25.6 58.7 28.7l83 11.7c22.1 3.1 44.6-.9 64.4-11.4l74-39.5c19.7-10.5 35.6-27 45.4-47.2l36.7-75.5c9.8-20.1 13-42.9 9.1-64.9-.9-5.3-5.3-9.3-10.6-10.1-51.5-8.2-92.8-47.1-104.5-97.4-1.8-7.6-8-13.4-15.7-14.6-54.6-8.7-97.7-52-106.2-106.8zM208 144a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM144 336a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm224-64a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"]};var Z8={prefix:"fas",iconName:"bars",icon:[448,512,["navicon"],"f0c9","M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"]};var c7={prefix:"fas",iconName:"book-open",icon:[512,512,[128214,128366],"f518","M256 141.3l0 309.3 .5-.2C311.1 427.7 369.7 416 428.8 416l19.2 0 0-320-19.2 0c-42.2 0-84.1 8.4-123.1 24.6-16.8 7-33.4 13.9-49.7 20.7zM230.9 61.5L256 72 281.1 61.5C327.9 42 378.1 32 428.8 32L464 32c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-35.2 0c-50.7 0-100.9 10-147.7 29.5l-12.8 5.3c-7.9 3.3-16.7 3.3-24.6 0l-12.8-5.3C184.1 490 133.9 480 83.2 480L48 480c-26.5 0-48-21.5-48-48L0 80C0 53.5 21.5 32 48 32l35.2 0c50.7 0 100.9 10 147.7 29.5z"]};var a7={prefix:"fas",iconName:"cake-candles",icon:[448,512,[127874,"birthday-cake","cake"],"f1fd","M86.4-10.5L61.8 31.6C58 38.1 56 45.6 56 53.2L56 56c0 22.1 17.9 40 40 40s40-17.9 40-40l0-2.8c0-7.6-2-15-5.8-21.6L105.6-10.5c-2-3.4-5.7-5.5-9.6-5.5s-7.6 2.1-9.6 5.5zm128 0L189.8 31.6c-3.8 6.5-5.8 14-5.8 21.6l0 2.8c0 22.1 17.9 40 40 40s40-17.9 40-40l0-2.8c0-7.6-2-15-5.8-21.6L233.6-10.5c-2-3.4-5.7-5.5-9.6-5.5s-7.6 2.1-9.6 5.5zM317.8 31.6c-3.8 6.5-5.8 14-5.8 21.6l0 2.8c0 22.1 17.9 40 40 40s40-17.9 40-40l0-2.8c0-7.6-2-15-5.8-21.6L361.6-10.5c-2-3.4-5.7-5.5-9.6-5.5s-7.6 2.1-9.6 5.5L317.8 31.6zM128 160c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 53.5C26.7 226.6 0 262.2 0 304l0 20.8c20.9 1.3 41.6 7.3 60.3 18l7.1 4.1c26.3 15 58.9 13.4 83.6-4.2 43.7-31.2 102.3-31.2 146 0 24.6 17.6 57.3 19.3 83.6 4.2l7.1-4.1c18.7-10.7 39.3-16.7 60.3-18l0-20.8c0-41.8-26.7-77.4-64-90.5l0-53.5c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 48-64 0 0-48c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 48-64 0 0-48zM448 373c-12.7 1.2-25.1 5-36.5 11.5l-7.1 4.1c-42.6 24.3-95.4 21.7-135.3-6.8-27-19.3-63.2-19.3-90.2 0-39.9 28.5-92.7 31.2-135.3 6.8l-7.1-4.1C25.1 378 12.7 374.1 0 373l0 75c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-75z"]};var A5={prefix:"fas",iconName:"circle-info",icon:[512,512,["info-circle"],"f05a","M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM224 160a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm-8 64l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z"]},l7=A5;var e7={prefix:"fas",iconName:"layer-group",icon:[512,512,[],"f5fd","M232.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 149.8C5.4 145.8 0 137.3 0 128s5.4-17.9 13.9-21.8L232.5 5.2zM48.1 218.4l164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 277.8C5.4 273.8 0 265.3 0 256s5.4-17.9 13.9-21.8l34.1-15.8zM13.9 362.2l34.1-15.8 164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 405.8C5.4 401.8 0 393.3 0 384s5.4-17.9 13.9-21.8z"]};var i7={prefix:"fab",iconName:"discord",icon:[576,512,[],"f392","M492.5 69.8c-.2-.3-.4-.6-.8-.7-38.1-17.5-78.4-30-119.7-37.1-.4-.1-.8 0-1.1 .1s-.6 .4-.8 .8c-5.5 9.9-10.5 20.2-14.9 30.6-44.6-6.8-89.9-6.8-134.4 0-4.5-10.5-9.5-20.7-15.1-30.6-.2-.3-.5-.6-.8-.8s-.7-.2-1.1-.2c-41.3 7.1-81.6 19.6-119.7 37.1-.3 .1-.6 .4-.8 .7-76.2 113.8-97.1 224.9-86.9 334.5 0 .3 .1 .5 .2 .8s.3 .4 .5 .6c44.4 32.9 94 58 146.8 74.2 .4 .1 .8 .1 1.1 0s.7-.4 .9-.7c11.3-15.4 21.4-31.8 30-48.8 .1-.2 .2-.5 .2-.8s0-.5-.1-.8-.2-.5-.4-.6-.4-.3-.7-.4c-15.8-6.1-31.2-13.4-45.9-21.9-.3-.2-.5-.4-.7-.6s-.3-.6-.3-.9 0-.6 .2-.9 .3-.5 .6-.7c3.1-2.3 6.2-4.7 9.1-7.1 .3-.2 .6-.4 .9-.4s.7 0 1 .1c96.2 43.9 200.4 43.9 295.5 0 .3-.1 .7-.2 1-.2s.7 .2 .9 .4c2.9 2.4 6 4.9 9.1 7.2 .2 .2 .4 .4 .6 .7s.2 .6 .2 .9-.1 .6-.3 .9-.4 .5-.6 .6c-14.7 8.6-30 15.9-45.9 21.8-.2 .1-.5 .2-.7 .4s-.3 .4-.4 .7-.1 .5-.1 .8 .1 .5 .2 .8c8.8 17 18.8 33.3 30 48.8 .2 .3 .6 .6 .9 .7s.8 .1 1.1 0c52.9-16.2 102.6-41.3 147.1-74.2 .2-.2 .4-.4 .5-.6s.2-.5 .2-.8c12.3-126.8-20.5-236.9-86.9-334.5zm-302 267.7c-29 0-52.8-26.6-52.8-59.2s23.4-59.2 52.8-59.2c29.7 0 53.3 26.8 52.8 59.2 0 32.7-23.4 59.2-52.8 59.2zm195.4 0c-29 0-52.8-26.6-52.8-59.2s23.4-59.2 52.8-59.2c29.7 0 53.3 26.8 52.8 59.2 0 32.7-23.2 59.2-52.8 59.2z"]};var s7={prefix:"fab",iconName:"github",icon:[512,512,[],"f09b","M173.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM252.8 8c-138.7 0-244.8 105.3-244.8 244 0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1 100-33.2 167.8-128.1 167.8-239 0-138.7-112.5-244-251.2-244zM105.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9s4.3 3.3 5.6 2.3c1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"]};var f7={prefix:"fab",iconName:"npm",icon:[576,512,[],"f3d4","M288 288l-32 0 0-64 32 0 0 64zM576 160l0 192-288 0 0 32-128 0 0-32-160 0 0-192 576 0zM160 192l-128 0 0 128 64 0 0-96 32 0 0 96 32 0 0-128zm160 0l-128 0 0 160 64 0 0-32 64 0 0-128zm224 0l-192 0 0 128 64 0 0-96 32 0 0 96 32 0 0-96 32 0 0 96 32 0 0-128z"]};var n7={prefix:"fab",iconName:"twitter",icon:[512,512,[],"f099","M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103l0-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z"]};export{v5 as a,c8 as b,a8 as c,r8 as d,i8 as e,s8 as f,f8 as g,n8 as h,o8 as i,t8 as j,z8 as k,m8 as l,M8 as m,p8 as n,u8 as o,d8 as p,L8 as q,v8 as r,C8 as s,h8 as t,g8 as u,x8 as v,b8 as w,N8 as x,S8 as y,y8 as z,k5 as A,k8 as B,w8 as C,A8 as D,P8 as E,F8 as F,T8 as G,D8 as H,B8 as I,R8 as J,H8 as K,q8 as L,E8 as M,U8 as N,I8 as O,W8 as P,G8 as Q,O8 as R,j8 as S,V8 as T,_8 as U,$8 as V,X8 as W,Y8 as X,K8 as Y,J8 as Z,Q8 as _,Z8 as $,c7 as aa,a7 as ba,l7 as ca,e7 as da,i7 as ea,s7 as fa,f7 as ga,n7 as ha};
