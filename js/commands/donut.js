terminal.addCommand("donut", async function() {
    setTimeout(() => terminal.scroll(), 100)
    let commandIsActive = true
    terminal.onInterrupt(() => commandIsActive = false)
    setTimeout(() => {
        if (commandIsActive) {
            terminal.printEasterEgg("Donut-Egg")
        }
    }, 3 * 60 * 1000)

    // mostly copied from original donut.c code

               let p=terminal.
           print(),A=1,B=1,f=()=>{
         let b=[];let z=[];A+=0.07;B
       +=0.03;let s=Math.sin,c=Math.cos
     ,cA=c(A),sA=s(A),cB=c(B),sB=s(B);for(
    let k=0;k<1760;k++){b[k]=k%80==79?"\n":
    " ";z[k]=0;};for        (let j=0;j<6.28;
    j+=0.07){let ct          =c(j),st=s(j);
    for(i=0;i<6.28;          i+=0.02){let sp
    =s(i),cp=c(i),h          =ct+2,D=1/(sp*h
    *sA+st*cA+5),t=sp       *h*cA-st*sA;let
    x=0|(40+30*D*(cp*h*cB-t*sB)),y=0|(12+15
     *D*(cp*h*sB+t*cB)),o=x+80*y,N=0|(8*((st
     *sA-sp*ct*cA)*cB-sp*ct*sA-st*cA-cp*ct
     *sB));if(y<22&&y>=0&&x>=0&&x<79&&D>z
       [o]){z[o]=D;b[o]=".,-~:;=!*#$@"[
          N>0?N:0];}}}p.textContent=b
            .join("")};while(1){f();
              await sleep(30);}

}, {
    description: "display a spinning donut"
})

