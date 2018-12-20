#include <stdio.h>
#include <string.h>
#include <time.h>

char b[100000];
char i[100000];
char m[256];

void init() {
    char a='a', b='A';
    while (a < 'z'+1) {
        m[a] = b;
        m[b++] = a++;
    }
}

void fix(char a, char b) {
    char *p=i, *q=i;
    while (*q!=0) {
        if (*q!=a && *q!=b) {
            *p++=*q++;
        } else
            q++;
    }
    *p=0;
}

void reduce() {
    char *p=i, *q=i+1;
    while (*q!=0) {
        if (m[*q] == *p) {
            if (p==i) {
                q++;
                *p = *q;
            } else {
                p--;
            }
            q++;
        } else {
            p++;
            *p = *q++;
        }
    }
    p++;
    *p=0;
}

void main() {
    char best='a';
    int min;
    init();
    while (!feof(stdin)) {
        scanf("%s", b);
        min=strlen(b);
        for (char x='a'; x < 'z'+1; x++) {
            strcpy(i,b);
            fix(x, m[x]);
            reduce();
            if (strlen(i)<min) {
                best = x;
                min = strlen(i);
            }
        }
        strcpy(i,b);
        fix(best, m[best]);
        reduce();
        printf("%s\nLength: %ld\n", i, strlen(i));
        printf("Best: %c\n", best);
        printf("%lf s\n",clock()/(double)CLOCKS_PER_SEC);
        // printf("%d %d %d\n", i[0], i[1], i[2]);
    }
}