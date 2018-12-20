#include <stdio.h>

int findAnswer(char codes[][50], int last) {
    for (int i=0; i < last; i++) {
        int diff=0;
        char *l = codes[last];
        for (char *p=codes[i];*p != 0; p++) {
            if (*p != *l++) diff++;
        }
        if (diff == 1) return i;
    }
    return 0;
}

void printAnswer(char codes[][50], int last) {
    printf("Answer:\n");
    int match = findAnswer(codes,last);
    char *l = codes[last];
    printf("%s\n%s\n", codes[match], l);
    for (char *p=codes[match]; *p != 0; p++) {
        if (*p==*l++) putchar(*p);
    }
    putchar('\n');
}

void main() {
    char codes[300][50];
    int r=0;
    while (!feof(stdin)) {
        if (scanf("%s",codes[r])>0 && findAnswer(codes, r)) break;
        r++;
    }
    // printf("Answer: %d\n", findAnswer(codes,r));
    printAnswer(codes, r);
}