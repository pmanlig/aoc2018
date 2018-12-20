#include <stdio.h>
#include <string.h>
#include <time.h>

int mem[6] = {0,0,0,0,0,0}, ip=0, ipr=0, p[40][4], l=0, optimize=0;

void addr() {
    mem[p[ip][3]] = mem[p[ip][1]] + mem[p[ip][2]];
}

void addi() {
    mem[p[ip][3]] = mem[p[ip][1]] + p[ip][2];
}

void mulr() {
    mem[p[ip][3]] = mem[p[ip][1]] * mem[p[ip][2]];
}

void muli() {
    mem[p[ip][3]] = mem[p[ip][1]] * p[ip][2];
}

void banr() {
    mem[p[ip][3]] = mem[p[ip][1]] & mem[p[ip][2]];
}

void bani() {
    mem[p[ip][3]] = mem[p[ip][1]] & p[ip][2];
}

void borr() {
    mem[p[ip][3]] = mem[p[ip][1]] | mem[p[ip][2]];
}

void bori() {
    mem[p[ip][3]] = mem[p[ip][1]] | p[ip][2];
}

void setr() {
    mem[p[ip][3]] = mem[p[ip][1]];
}

void seti() {
    mem[p[ip][3]] = p[ip][1];
}

void gtir() {
    mem[p[ip][3]] = p[ip][1] > mem[p[ip][2]];
}

void gtri() {
    mem[p[ip][3]] = mem[p[ip][1]] > p[ip][2];
}

void gtrr() {
    mem[p[ip][3]] = mem[p[ip][1]] > mem[p[ip][2]];
}

void eqir() {
    mem[p[ip][3]] = p[ip][1] == mem[p[ip][2]];
}

void eqri() {
    mem[p[ip][3]] = mem[p[ip][1]] == p[ip][2];
}

void eqrr() {
    mem[p[ip][3]] = mem[p[ip][1]] == mem[p[ip][2]];
}

char map[16][10] = {"addr", "addi", "mulr", "muli", "banr", "bani", "borr", "bori", "setr", "seti", "gtir", "gtri", "gtrr", "eqir", "eqri", "eqrr"};
void (*fw[16])() = { addr, addi, mulr, muli, banr, bani, borr, bori, setr, seti, gtir, gtri, gtrr, eqir, eqri, eqrr };

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

void execute() {
    int i=0, o[6] = {0,1,2,3,4,5};
    ip=0;
    if (optimize) {
        o[1] = p[4][1];
        o[2] = p[3][2];
        o[3] = p[4][2];
        o[5] = p[3][1];
    }
    while (i < 1000 && ip < l) {
        mem[ipr] = ip;
        if (optimize) {
            if (ip == 4 && mem[o[2]]==1) {
                mem[o[2]] = mem[o[3]] / mem[o[5]];
                mem[o[1]] = mem[o[2]] * mem[o[5]];
            }

            if (ip == 9 && mem[o[2]]*mem[o[5]] > mem[o[3]]) mem[o[2]]=mem[o[3]]+1;
        }
        
        // debug();
        /*
        */
        (*fw[p[ip][0]])();
        ip = mem[ipr];
        ip++;
    }
}

int calc() {
    int sum=0, magic=10551348;
    for (int i=1; i<=10551348/2; i++)
        if (magic % i==0) sum +=i;
    return sum;
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
    // for (int i=0; i<l; i++) printf("%s %d %d %d\n",map[p[i][0]], p[i][1], p[i][2], p[i][3]);
    mem[0]=1;
    optimize=1;
    execute();
    debug();
    printf("%d lines of input read\n", lines);
    printf(ip < l ? "FAIL\n" : "OK\n");
    // printf("Extrapolated: %d\n", calc());
    printf("Time to complete: %lfs\n",clock()/(double)CLOCKS_PER_SEC);
}