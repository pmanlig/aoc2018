#include <stdio.h>
#include <string.h>
#include <time.h>
#define MAX_ANSWERS 2000000

int mem[6] = {0,0,0,0,0,0}, ip=0, ipr=0, p[40][4], l=0, optimize=0, findhalt=0;

int target() {
    return p[ip][3];
}

int a() {
    return p[ip][1];
}

int b() {
    return p[ip][2];
}

int regA() {
    return mem[p[ip][1]];
}

int regB() {
    return mem[p[ip][2]];
}

void set(int r) {
    mem[target()] = r;
}

int detectConditional(char *fmt) {
    int next = ip+1;
    if (ipr == p[next][3] && (ipr == p[next][1] || ipr == p[next][2])
        && (target() == p[next][1] || target() == p[next][2])) {
            char buf[50];
            sprintf(buf, fmt, a(), b());
            printf("%2d: IF (%s) SKIP TO %d\n", ip, buf, ip+3);
            ip++;
            return 1;
        }
    return 0;
}

int detectJump(int r) {
    if (ipr == target()) {
        printf("%2d: GOTO %d\n", ip, r+1);
        return 1;
    }
    return 0;
}

void disassemble(char *fmt) {
    printf("%2d: ",ip);
    if (target() == ipr) printf("GOTO: ");
    printf(fmt, target(), a(), b());
}

void addr() {
    mem[target()] = regA() + regB();
}

void daddr() {
    disassemble("r[%d] = r[%d] + r[%d]\n");
}

void addi() {
    mem[p[ip][3]] = mem[p[ip][1]] + p[ip][2];
}

void daddi() {
    if (target() == ipr && a() == ipr) printf("%2d: GOTO %d\n", ip, ip+b()+1);
    else if (target() == ipr) printf("%2d: GOTO r[%d] + %d\n", ip, a(), b()+1);
    else disassemble("r[%d] = r[%d] + %d\n");
}

void mulr() {
    mem[p[ip][3]] = mem[p[ip][1]] * mem[p[ip][2]];
}

void dmulr() {
    disassemble("r[%d] = r[%d] * r[%d]\n");
}

void muli() {
    mem[target()] = regA() * b();
}

void dmuli() {
    disassemble("r[%d] = r[%d] * %d\n");
}

void banr() {
    mem[target()] = regA() & regB();
}

void dbanr() {
    disassemble("r[%d] = r[%d] & r[%d]\n");
}

void bani() {
    mem[target()] = mem[p[ip][1]] & p[ip][2];
}

void dbani() {
    disassemble("r[%d] = r[%d] & %d\n");
}

void borr() {
    mem[p[ip][3]] = mem[p[ip][1]] | mem[p[ip][2]];
}

void dborr() {
    disassemble("r[%d] = r[%d] | r[%d]\n");
}

void bori() {
    mem[p[ip][3]] = mem[p[ip][1]] | p[ip][2];
}

void dbori() {
    disassemble("r[%d] = r[%d] | %d\n");
}

void setr() {
    mem[p[ip][3]] = mem[p[ip][1]];
}

void dsetr() {
    if (target() == ipr) printf("%2d: GOTO r[%d]+1\n", ip, regA());
    else disassemble("r[%d] = r[%d]\n");
}

void seti() {
    mem[p[ip][3]] = p[ip][1];
}

void dseti() {
    if (!detectJump(a()))
        disassemble("r[%d] = %d\n");
}

void gtir() {
    mem[p[ip][3]] = p[ip][1] > mem[p[ip][2]];
}

void dgtir() {
    if (!detectConditional("%d > r[%d]"))
        disassemble("r[%d] = %d > r[%d]\n");
}

void gtri() {
    mem[p[ip][3]] = mem[p[ip][1]] > p[ip][2];
}

void dgtri() {
    if (!detectConditional("r[%d] > %d"))
        disassemble("r[%d] = r[%d] > %d\n");
}

void gtrr() {
    mem[p[ip][3]] = mem[p[ip][1]] > mem[p[ip][2]];
}

void dgtrr() {
    if (!detectConditional("r[%d] > r[%d]"))
        disassemble("r[%d] = r[%d] > r[%d]\n");
}

void eqir() {
    mem[p[ip][3]] = p[ip][1] == mem[p[ip][2]];
}

void deqir() {
    if (!detectConditional("%d == r[%d]"))
        disassemble("r[%d] = %d == r[%d]\n");
}

void eqri() {
    mem[p[ip][3]] = mem[p[ip][1]] == p[ip][2];
}

void deqri() {
    if (!detectConditional("r[%d] == %d"))
        disassemble("r[%d] = r[%d] == %d\n");
}

void eqrr() {
    mem[p[ip][3]] = mem[p[ip][1]] == mem[p[ip][2]];
}

void deqrr() {
    if (!detectConditional("r[%d] == r[%d]"))
        disassemble("r[%d] = r[%d] == r[%d]\n");
}

char map[16][10] = {"addr", "addi", "mulr", "muli", "banr", "bani", "borr", "bori", "setr", "seti", "gtir", "gtri", "gtrr", "eqir", "eqri", "eqrr"};
void (*fw[16])() = { addr, addi, mulr, muli, banr, bani, borr, bori, setr, seti, gtir, gtri, gtrr, eqir, eqri, eqrr };
void (*dbg[16])() = { daddr, daddi, dmulr, dmuli, dbanr, dbani, dborr, dbori, dsetr, dseti, dgtir, dgtri, dgtrr, deqir, deqri, deqrr };

void parseLine() {
    char buf[10];
    scanf("%s", buf);
    if (0==strcmp(buf,"#ip")) scanf("%d", &ipr);
    else for (int i=0;i<16;i++) {
        if (0==strcmp(buf,map[i])) {
            p[l][0] = i;
            scanf("%d %d %d", &p[l][1], &p[l][2], &p[l][3]);
            l++;
        }
    }
}

void debug() {
    printf("[%d, %d, %d, %d, %d, %d], ip=%d", mem[0], mem[1], mem[2], mem[3], mem[4], mem[5], ip);
    if (ip < l) printf(", p=[%s %d %d %d]", map[p[ip][0]], p[ip][1], p[ip][2], p[ip][3]);
    printf("\n");
}

void execute(int limit) {
    int cand[MAX_ANSWERS], c=0;
    int i=0, o[6] = {0,1,2,3,4,5};
    ip=0;
    if (optimize) {
        o[1] = p[4][1];
        o[2] = p[3][2];
        o[3] = p[4][2];
        o[5] = p[3][1];
    }
    while (ip < l) {
        if (limit != -1 && i++ >limit) break;
        if (findhalt && ip==28) {
            printf("Halts on: %d\n", mem[p[ip][1]]);
            break;
        }
        if (ip == 28) {
            printf("Halt on: %d\n", mem[p[ip][1]]);
            cand[c++] = mem[p[ip][1]];
            for (int i=0; i < MAX_ANSWERS && i < c-1; i++)
                if (cand[i]==cand[c]) break;
            if (c==MAX_ANSWERS) break;
        }
        mem[ipr] = ip;
        if (optimize) {
            if (ip == 4 && mem[o[2]]==1) {
                mem[o[2]] = mem[o[3]] / mem[o[5]];
                mem[o[1]] = mem[o[2]] * mem[o[5]];
            }

            if (ip == 9 && mem[o[2]]*mem[o[5]] > mem[o[3]]) mem[o[2]]=mem[o[3]]+1;
        }
        
        // debug();
        (*fw[p[ip][0]])();
        ip = mem[ipr];
        ip++;
    }
}

void list() {
    printf("ipr=%d\n", ipr);
    for(ip=0; ip<l; ip++) {
        (*dbg[p[ip][0]])();
    }
}

void calc() {
    int cand[MAX_ANSWERS], c=0;
    int a, b=0;
    while (c<MAX_ANSWERS) {
        a = b | 65536;
        b = 15466939;
        while (a > 0) {
            b = (((b+(a % 256))&0xFFFFFF)*65899)&0xFFFFFF;
            a = a / 256;
        }
        // printf("B is %d\n", b);
        for (int j=0; j<c; j++) {
            if (b==cand[j]) {
                printf("Recurring solution %d in %d iterations, previous is %d\n", b, c, cand[c-1]);
                return;
            }
        }
        cand[c++]=b;
    }
    printf("Didn't find an answer...\n");
}

void main() {
    char b;
    int lines=1;
    while (!feof(stdin)) {
        parseLine();
        if (feof(stdin)) break;
        do { b=getchar(); } while ('\n'!=b);
        if ('\n'==b) lines++;
    }
    // list();
    // for (int i=0; i<l; i++) printf("%s %d %d %d\n",map[p[i][0]], p[i][1], p[i][2], p[i][3]);
    // mem[0]=1;
    // optimize=1;
    // execute(-1);
    // execute(20);
    // debug();
    // printf("%d lines of input read\n", lines);
    // printf(ip < l ? "FAIL\n" : "OK\n");
    calc();
    printf("Time to complete: %lfs\n",clock()/(double)CLOCKS_PER_SEC);
}