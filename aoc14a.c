#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#define LIMIT 60000000

long e1=0, e2=1, c=2, ans=0;
char *r, want[10], w=0;

void mix() {
    int m = r[e1]+r[e2];
    if (m>9) r[c++]=1;
    r[c++]=m%10;
    e1+=r[e1]+1;
    e2+=r[e2]+1;
    while (e1>=c) e1-=c;
    while (e2>=c) e2-=c;
}

void printAnswer(int t) {
    char *a = r+t;
    printf("Answer: ");
    for (int i=0; i<10; i++) printf("%d", *a++);
    printf("\n");
}

void printState() {
    for (int n=0; n<c; n++) {
        printf("%c%d%c", n==e1?'(':(n==e2?'[':' '), r[n], n==e1?')':(n==e2?']':' '));
    }
    printf("\n");
}

int compare(char *x, char *y, char l) {
    for (long i=0; i<l; i++) {
        if (*x++ != *y++) return 0;
    }
    return 1;
}

int match() {
    while (ans+w<c) {
        if (compare(r+ans, want, w)) return 1;
        ans++;
    }
    return 0;
}

void readInput() {
    char input[10];
    scanf("%10s", input);
    while (input[w]!=0) want[w++]=input[w]-'0';
    // printf("Input: %s ", input);
    // for (int i=0; i<w; i++) printf("%d", want[i]);
    // printf("\n");
}

void main() {
    r = (char*)malloc(LIMIT*sizeof(char));
    r[0] = 3;
    r[1] = 7;
    // printState();
    // while (!feof(stdin)) {
        readInput();
        // while (c < t+10) {
        while (c < LIMIT && !match()) {
            mix();
            // if (c%1000==0) printf("%ld\n", c);
            // printState();
        }
        printf("Answer: %ld reciepes\n", ans);
    // }
    printf("Time to complete: %lfs\n",clock()/(double)CLOCKS_PER_SEC);
}