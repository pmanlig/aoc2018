#include <stdio.h>
#include <time.h>
#define SIZE 500

char b[1000], r[32], *n;
long o;

void output(long step) {
    printf("%ld: ", step);
    for (char *p=n; p<n+200; p++) putchar(*p);
    printf("\n");
}

long calc() {
    long res = 0;
    for (int i=0; i<500; i++)
        if ('#' == n[i]) res += i+o;
    return res;
}

void readInitial() {
    char *c=b+4, t[50], d;
    o=-4;
    n=b;
    for (char *p=b; p<b+1000; p++) *p='.';
    scanf("%s %s %c", t, t, &d);
    printf("Initial: %s\n", t);
    while('\n'!=d && d=='.') o++;
    while('\n'!=d) {
        if ('.'==d || '#'==d) *c++=d;
        d=getchar();
    }
    for (c=n; c<n+100; c++) putchar(*c);
    putchar('\n');
}

int hash(char *s) {
    int h=0;
    for (char *p=s; p<s+5; p++)
        h=h*2+('#'==*p?1:0);
    return h;
}

void readRule() {
    char t[50];
    scanf("%s %s %c", t, t+20, t+30);
    r[hash(t)]=t[30];
}

void tick() {
    int offset=-2;
    char *p=n;
    char *q=(n==b?b+500:b)+4;
    char x = r[hash(p++)];
    while (p<n+497 && '.'==x) {
        offset++;
        x = r[hash(p++)];
    }
    while (p<n+497) {
        *q++ = x;
        x = r[hash(p++)];
    }
    o+=offset;
    n=(n==b?b+500:b);
}

int compare() {
    char *p=b, *q=b+500;
    while (p<b+497) if (*p++ != *q++) return 0;
    return 1;
}

void main() {
    char t=0;
    int lines=1;
    for (int i=0; i<32; i++) r[i]='.';
    readInitial();
    while (!feof(stdin)) {
        readRule();
        do {
            t=getchar();
        } while (!feof(stdin) && t != '\n');
        if ('\n'==t) lines++;
    }
    printf("Rules: ");
    for (int i=0; i<32; i++) putchar(r[i]);
    printf("\n");
    printf("%d lines of input read\n", lines);
    int i;
    long d;
    for (d=0; d<50000000000; d++) {
        if (d%100000==0) output(d);
        // output(i);
        tick();
    }
    d = o;
    /*
    printf("Cyclic: %s\n", compare()?"YES":"NO");
    for (i=0; i<200; i++) {
        tick();
    }
    d = o-d;
    o += ((50000000000-400)/200)*d;
    */
    output(i);
    printf("Sum: %ld\n", calc());
    printf("Time to complete: %lfs\n",clock()/(double)CLOCKS_PER_SEC);
}