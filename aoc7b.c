#include <stdio.h>
#define TRUE 1
#define FALSE 0

char buf[100], b=0, p, q;
int count=0, ex=0;
char o[101][2];
char e[27];
int w[5] = { 0,0,0,0,0 }, t=0, c[26];

int occurs(char a) {
    for (int i=0; i<count; i++)
        if (o[i][0]==a || o[i][1]==a) return TRUE;
    return FALSE;
}

void countChars() {
    for (char a='A'; a<'Z'+1; a++)
        if (occurs(a)) e[ex++] = a;
}

int exists(char a) {
    for (int i=0; i<ex; i++)
        if (e[i]==a) return TRUE;
    return FALSE;
}

void printDependency() {
    for (int i=0; i< count; i++) {
        printf("%c -> %c\n", o[i][0], o[i][1]);
    }
}

int remains() {
    return b < ex;
}

int canDo(char a, int t) {
    for (int i=0; i < count; i++) {
        if (o[i][0]==a && (c[o[i][1]-'A']==0 || c[o[i][1]-'A']>t)) return FALSE;
    }
    return TRUE;
}

int used(char a) {
    for (int i=0; i<b; i++)
        if (buf[i]==a) return TRUE;
    return FALSE;
}

char find(int t) {
    for (char a='A'; a<'Z'+1;a++) {
        if (exists(a) && !used(a) && canDo(a,t))
            return a;
    }
    return 0;
}

void pick(char a) {
    printf("%d: %c\n", b, a);
    buf[b++] = a;
    for(int i=0; i<count; i++)
        if (o[i][1]==a) o[i][1]=0;
}

int assign(char n) {
    for (int i=0; i<5; i++) {
        if (w[i]<=t) {
            printf("Assigning step %c on time %d to worker %d\n", n, t, i);
            w[i]=c[n-'A']=t+61+n-'A';
            buf[b++]=n;
            return TRUE;
        }
    }
    return FALSE;
}

void assignWork() {
    char next = find(t);
    if (next == 0 || !assign(next)) {
        int ot=t;
        t = 200000;
        for (int i=0;i<5;i++)
            if (w[i]<t&&w[i]>ot) t=w[i];
        printf("Cannot find available worker or task - advanced time to %d\n", t);
    }
}

void main() {
    while (!feof(stdin)) {
        scanf("%s %c %s %s %s %s %s %c ", buf, &o[count][1], buf, buf, buf, buf, buf, &o[count][0]);
        b=0;
        while (!feof(stdin) && b!='\n') b=getchar();
        count++;
    }
    printf("%d rows\n", count);
    printDependency();
    countChars();
    printf("%s used (%d)\n", e, ex);
    b=0;
    for (int i=0; i<('Z'-'A'+1); i++) c[i]=0;
    for (int i=0; i<100 && remains();i++) {
        assignWork();
    }
    buf[b++]=0;
    printf("%s (%d)\n",buf,b);
    printf("Workers busy until [%d, %d, %d, %d, %d]\n", w[0], w[1], w[2], w[3], w[4]);
}